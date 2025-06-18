import axios from 'axios';

const API_KEY = 'AIzaSyADLXdLtdYq8BdT8GFMDAd2Llc1a7Ef1cw'; // Cảnh báo: KHÔNG AN TOÀN CHO ỨNG DỤNG SẢN XUẤT!
const GEMINI_API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

const MAX_CONVERSATION_PAIRS = 5;

interface ContentPart {
    text: string;
    // Thêm trường tùy chọn để chỉ định nút hành động
    actionButton?: {
        type: 'copyPaymentCode';
        value: string; // Giá trị cần sao chép
        label: string; // Nhãn hiển thị trên nút
    };
}

interface Content {
    role: 'user' | 'model';
    parts: ContentPart[];
}

interface GeminiApiRequestBody {
    contents: Content[];
}

interface GeminiApiResponse {
    candidates: {
        content: {
            parts: { text: string }[];
        };
    }[];
}

class GeminiApiClient {
    private apiEndpoint: string;
    private chatHistory: Content[] = [];
    private initialInstructionGiven: boolean = false;

    constructor(endpoint: string = GEMINI_API_ENDPOINT) {
        this.apiEndpoint = endpoint;
    }

    private ensureInitialInstruction() {
        if (!this.initialInstructionGiven) {
            this.chatHistory = [
                {
                    role: 'user',
                    parts: [
                        {
                            text: 'Bạn là Măm Map Bot, một trợ lý ảo của nền tảng Măm Map. Măm Map là một hệ thống trung gian giúp các chủ quán ăn vặt đăng ký và quản lý thông tin quán của họ, đồng thời cho phép người dùng tìm kiếm, đánh giá và review các quán ăn vặt. Mọi câu trả lời của bạn phải liên quan đến cách sử dụng nền tảng Măm Map, lợi ích cho chủ quán, cách review, cách tìm quán, giải quyết vấn đề trên nền tảng. Nếu người dùng hỏi về quán ăn cụ thể hoặc món ăn ngon ở một khu vực, hãy hướng dẫn họ cách sử dụng tính năng tìm kiếm trên Măm Map để tìm quán phù hợp. Tuyệt đối không tư vấn về món ăn cụ thể của một quán hoặc gợi ý quán ăn ngoài nền tảng. Luôn giữ thái độ thân thiện, chuyên nghiệp và hữu ích. Bạn đặc biệt hỗ trợ các chủ cửa hàng (Merchant) về các vấn đề thanh toán. Nếu người dùng hỏi về lỗi thanh toán, bạn hãy hỏi họ mã giao dịch. Nếu họ cung cấp mã giao dịch (có thể là một chuỗi ký tự hoặc số), bạn hãy trả lời lại mã giao dịch đó kèm thông tin ngân hàng của Măm Map (BIDV, STK: 6411079652) và yêu cầu họ chuyển khoản. Nếu họ hỏi không biết mã giao dịch ở đâu, hãy hướng dẫn họ vào lịch sử giao dịch và nhấn icon copy.',
                        },
                    ],
                },
                {
                    role: 'model',
                    parts: [
                        { text: 'Vâng, tôi đã hiểu rõ. Măm Map xin chào! Tôi là Măm Map Bot, sẵn sàng hỗ trợ bạn về cách sử dụng nền tảng review quán ăn vặt Măm Map. Bạn có câu hỏi nào cho tôi không?' },
                    ],
                },
            ];
            this.initialInstructionGiven = true;
        }
    }

    private trimChatHistory() {
        if (this.chatHistory.length > 2 + MAX_CONVERSATION_PAIRS * 2) {
            const startIndex = this.chatHistory.length - (MAX_CONVERSATION_PAIRS * 2);
            this.chatHistory = [
                this.chatHistory[0],
                this.chatHistory[1],
                ...this.chatHistory.slice(startIndex),
            ];
        }
    }

    async generateContent(prompt: string, userName: string | null = null): Promise<string> {
        this.ensureInitialInstruction();

        const lowerCasePrompt = prompt.toLowerCase().trim();
        let finalBotResponseText: string;
        let actionButtonData: ContentPart['actionButton'] | undefined; // Dữ liệu cho nút hành động
        const greetingName = userName ? ` ${userName}` : ''; // Lấy tên người dùng

        // Kiểm tra các câu chào
        if (
            lowerCasePrompt === 'xin chào' ||
            lowerCasePrompt === 'chào' ||
            lowerCasePrompt === 'hi' ||
            lowerCasePrompt === 'hello' ||
            lowerCasePrompt === 'alo' ||
            lowerCasePrompt === 'ê'
        ) {
            finalBotResponseText = `Măm Map xin chào${greetingName}! Tôi là Măm Map Bot, bạn cần hỗ trợ gì về nền tảng review quán ăn vặt Măm Map ạ?`;
            this.chatHistory.push(
                { role: 'user', parts: [{ text: prompt }] },
                { role: 'model', parts: [{ text: finalBotResponseText }] },
            );
            return finalBotResponseText;
        }

        // Kiểm tra câu hỏi tìm quán ăn hoặc món ngon (giữ nguyên cho người dùng thông thường nếu có)
        const findRestaurantKeywords = ['quán ăn', 'quán nào', 'ngon', 'khu vực', 'quận', 'gần đây', 'ở đâu'];
        const isFindRestaurantQuery = findRestaurantKeywords.some(keyword =>
            lowerCasePrompt.includes(keyword),
        );

        if (isFindRestaurantQuery) {
            finalBotResponseText =
                `Chào bạn${greetingName}, để tìm quán ăn vặt ngon, bạn có thể sử dụng tính năng tìm kiếm trên Măm Map! Hãy vào mục "Tìm quán" trên ứng dụng, nhập địa điểm (ví dụ: Quận 9) hoặc loại món ăn bạn thích, sau đó lọc theo đánh giá và review từ người dùng. Bạn muốn tôi hướng dẫn chi tiết cách dùng tính năng này không?`;
            this.chatHistory.push(
                { role: 'user', parts: [{ text: prompt }] },
                { role: 'model', parts: [{ text: finalBotResponseText }] },
            );
            return finalBotResponseText;
        }

        // --- Logic mới cho Merchant và thanh toán ---

        // 1. Keywords liên quan đến LỖI thanh toán gói dịch vụ
        const paymentErrorKeywords = ['lỗi thanh toán', 'thanh toán thất bại', 'thanh toán không được', 'không thanh toán được', 'sự cố thanh toán', 'gặp vấn đề về thanh toán', 'mua gói không được'];
        const isPaymentErrorQuery = paymentErrorKeywords.some(keyword =>
            lowerCasePrompt.includes(keyword)
        );

        // 2. Keywords người dùng HỎI CÁCH TÌM mã giao dịch
        const howToFindCodeKeywords = ['mã giao dịch ở đâu', 'không biết mã giao dịch', 'tìm mã giao dịch', 'lấy mã giao dịch', 'cách tìm mã giao dịch'];
        const isHowToFindCodeQuery = howToFindCodeKeywords.some(keyword =>
            lowerCasePrompt.includes(keyword)
        );

        // 3. Regex để phát hiện MÃ GIAO DỊCH (ví dụ: DH20250618063033747, hoặc chỉ là một chuỗi ký tự/số dài)
        const paymentCodeRegex = /(DH\d{10,}|[a-z0-9]{15,}|^\d{10,}\s*$)/i; // Ví dụ: DH + 10 số, hoặc 15+ ký tự alphanumeric, hoặc chỉ 10+ số
        const matchesPaymentCode = lowerCasePrompt.match(paymentCodeRegex);
        const providedPaymentCode = matchesPaymentCode ? matchesPaymentCode[0].toUpperCase() : null; // Chuyển sang chữ hoa cho đồng nhất


        // Lấy tin nhắn cuối cùng của bot để biết ngữ cảnh cuộc trò chuyện
        const lastBotMessage = this.chatHistory[this.chatHistory.length - 1]?.parts[0]?.text.toLowerCase();
        const askedForPaymentCodePreviously = lastBotMessage?.includes('mã giao dịch của bạn là gì') || lastBotMessage?.includes('mã giao dịch là gì');

        // Logic điều hướng
        if (isPaymentErrorQuery) {
            // Trường hợp 1: Người dùng hỏi về lỗi thanh toán
            finalBotResponseText = `Chào bạn${greetingName}, tôi hiểu bạn đang gặp sự cố với việc thanh toán gói dịch vụ. Để tôi có thể hỗ trợ tốt nhất, bạn vui lòng cung cấp **mã giao dịch** của bạn là gì ạ?`;
            this.chatHistory.push(
                { role: 'user', parts: [{ text: prompt }] },
                { role: 'model', parts: [{ text: finalBotResponseText }] },
            );
            return finalBotResponseText;
        } else if (providedPaymentCode && askedForPaymentCodePreviously) {
            // Trường hợp 2: Người dùng cung cấp mã giao dịch sau khi bot đã hỏi
            // Xác nhận mã và cung cấp thông tin ngân hàng, kèm nút copy mã GD
            finalBotResponseText = `Cảm ơn bạn${greetingName} đã cung cấp mã giao dịch **${providedPaymentCode}**.
            \nVui lòng chuyển khoản phí dịch vụ cho Măm Map qua ngân hàng **BIDV**, số tài khoản: **6411079652**.
            \nSau khi chuyển khoản, giao dịch của bạn sẽ được xử lý sớm nhất. Nếu cần hỗ trợ thêm, đừng ngần ngại hỏi nhé!`;
            
            // Thiết lập actionButtonData
            actionButtonData = {
                type: 'copyPaymentCode',
                value: providedPaymentCode,
                label: 'Sao chép mã giao dịch',
            };

            this.chatHistory.push(
                { role: 'user', parts: [{ text: prompt }] },
                { role: 'model', parts: [{ text: finalBotResponseText, actionButton: actionButtonData }] }, // Đã thêm actionButton ở đây
            );
            return finalBotResponseText;
        } else if (isHowToFindCodeQuery) {
            // Trường hợp 3: Người dùng hỏi cách tìm mã giao dịch
            finalBotResponseText = `Chào bạn${greetingName}, bạn có thể tìm thấy mã giao dịch trong **Lịch sử giao dịch** trên ứng dụng Măm Map. Mã giao dịch thường hiển thị rõ ràng, và bạn có thể nhấn vào **biểu tượng sao chép (copy icon)** bên cạnh để sao chép mã đó một cách dễ dàng.
            \nBạn vào mục "Của tôi" (tab User) -> "Lịch sử giao dịch" để xem chi tiết nhé!`;
            this.chatHistory.push(
                { role: 'user', parts: [{ text: prompt }] },
                { role: 'model', parts: [{ text: finalBotResponseText }] },
            );
            return finalBotResponseText;
        }

        // --- Kết thúc logic mới ---

        // Gửi các câu hỏi khác đến API và chèn tên vào phản hồi
        this.chatHistory.push({ role: 'user', parts: [{ text: prompt }] });
        this.trimChatHistory();

        const requestBody: GeminiApiRequestBody = {
            contents: this.chatHistory,
        };

        try {
            const response = await axios.post<GeminiApiResponse>(this.apiEndpoint, requestBody, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 15000,
            });

            const data = response.data;

            if (
                !data ||
                !data.candidates ||
                !Array.isArray(data.candidates) ||
                !data.candidates[0] ||
                !data.candidates[0].content ||
                !data.candidates[0].content.parts ||
                !Array.isArray(data.candidates[0].content.parts) ||
                !data.candidates[0].content.parts[0] ||
                !data.candidates[0].content.parts[0].text
            ) {
                throw new Error('Phản hồi từ Gemini API không đúng định dạng. Vui lòng thử lại.');
            }

            let botResponseFromApi = data.candidates[0].content.parts[0].text;

            // Kiểm tra xem câu trả lời từ API có chứa lời chào không
            const greetingPatterns = [
                /^chào bạn/i,
                /^chào anh/i,
                /^chào chị/i,
                /^xin chào/i,
                /^vâng,/i, // Đôi khi bot sẽ trả lời "Vâng, tôi đã hiểu..."
                /^tôi là/i, // Tránh trường hợp bot tự giới thiệu lại
            ];

            let startsWithGreeting = false;
            for (const pattern of greetingPatterns) {
                if (pattern.test(botResponseFromApi.trim())) {
                    startsWithGreeting = true;
                    break;
                }
            }

            // Chèn tên vào đầu câu trả lời nếu userName tồn tại và câu trả lời không quá ngắn
            if (userName && botResponseFromApi.length > 5) {
                if (startsWithGreeting) {
                    let modifiedResponse = botResponseFromApi.trim();
                    const firstGreetingMatch = greetingPatterns.find(pattern => pattern.test(modifiedResponse));

                    if (firstGreetingMatch) {
                        if (modifiedResponse.toLowerCase().startsWith('chào bạn') ||
                            modifiedResponse.toLowerCase().startsWith('xin chào') ||
                            modifiedResponse.toLowerCase().startsWith('vâng, tôi đã hiểu rõ.')
                        ) {
                            modifiedResponse = modifiedResponse
                                .replace(/^chào bạn\s*!?/i, '')
                                .replace(/^xin chào\s*!?/i, '')
                                .replace(/^vâng, tôi đã hiểu rõ\.\s*!/i, '');
                            if (modifiedResponse.length > 0 && modifiedResponse[0] === modifiedResponse[0].toUpperCase() && modifiedResponse[0] !== modifiedResponse[0].toLowerCase()) {
                                modifiedResponse = modifiedResponse.charAt(0).toLowerCase() + modifiedResponse.slice(1);
                            }
                        }
                    }
                    finalBotResponseText = `Chào bạn ${userName}, ${modifiedResponse.charAt(0).toLowerCase() + modifiedResponse.slice(1)}`;

                } else {
                    finalBotResponseText = `Chào bạn ${userName}, ${botResponseFromApi.charAt(0).toLowerCase() + botResponseFromApi.slice(1)}`;
                }
            } else {
                finalBotResponseText = botResponseFromApi;
            }

            console.log('Bot response with name:', finalBotResponseText);

            this.chatHistory.push({ role: 'model', parts: [{ text: finalBotResponseText }] });

            return finalBotResponseText;
        } catch (error: any) {
            if (this.chatHistory.length > 0 && this.chatHistory[this.chatHistory.length - 1].role === 'user') {
                this.chatHistory.pop();
            }

            console.error('Lỗi khi gọi Gemini API:', error);

            if (axios.isAxiosError(error)) {
                if (error.response) {
                    const statusCode = error.response.status;
                    const errorMessage = error.response.data?.error?.message || 'Lỗi không xác định từ máy chủ.';

                    if (statusCode === 429) {
                        throw new Error(`Măm Map Bot đang quá tải, vui lòng thử lại sau ít phút nhé! (${errorMessage})`);
                    } else if (statusCode >= 400 && statusCode < 500) {
                        throw new Error(`Có vẻ như có vấn đề với yêu cầu của bạn, Măm Map Bot không hiểu. (${errorMessage})`);
                    } else if (statusCode >= 500) {
                        throw new Error(`Hệ thống Măm Map Bot đang gặp sự cố nội bộ. Vui lòng thử lại sau. (${errorMessage})`);
                    } else {
                        throw new Error(`Đã xảy ra lỗi không mong muốn từ máy chủ: ${errorMessage}`);
                    }
                } else if (error.request) {
                    throw new Error('Không thể kết nối đến Măm Map Bot. Vui lòng kiểm tra kết nối mạng của bạn.');
                } else {
                    throw new Error(`Đã xảy ra lỗi khi chuẩn bị gửi tin nhắn: ${error.message}`);
                }
            } else {
                throw new Error(`Đã xảy ra lỗi không xác định: ${error.message || 'Vui lòng thử lại.'}`);
            }
        }
    }

    resetChatHistory() {
        this.chatHistory = [];
        this.initialInstructionGiven = false;
    }
}

export const geminiApiClient = new GeminiApiClient();