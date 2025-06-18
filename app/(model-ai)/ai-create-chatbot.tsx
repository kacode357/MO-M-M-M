import axios from 'axios'; // Nhập axios
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const API_KEY = 'AIzaSyADLXdLtdYq8BdT8GFMDAd2Llc1a7Ef1cw'; // Cảnh báo: Không an toàn cho ứng dụng sản xuất!
const GEMINI_API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

// Định nghĩa kiểu cho một tin nhắn
interface ChatMessage {
    role: 'user' | 'bot'; // Chỉ có thể là 'user' hoặc 'bot'
    text: string;
}

const AiCreateChatBot = () => {
    const [prompt, setPrompt] = useState<string>('');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const sendMessage = async () => {
        if (!prompt.trim()) {
            setError('Vui lòng nhập tin nhắn của bạn.');
            return;
        }

        setLoading(true);
        setError(null);

        const userMessage: ChatMessage = { role: 'user', text: prompt };
        setChatHistory((prevHistory) => [...prevHistory, userMessage]);
        setPrompt(''); // Xóa nội dung input sau khi gửi

        try {
            const requestBody = {
                contents: [
                    {
                        parts: [{ text: prompt }],
                    },
                ],
            };

            // Sử dụng axios để gửi yêu cầu POST
            const response = await axios.post(GEMINI_API_ENDPOINT, requestBody, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = response.data; // Axios tự động phân tích JSON

            // Kiểm tra cấu trúc phản hồi từ Gemini API
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
                throw new Error('Phản hồi từ Gemini API không đúng định dạng.');
            }

            const botResponseText = data.candidates[0].content.parts[0].text;

            const botMessage: ChatMessage = { role: 'bot', text: botResponseText };
            setChatHistory((prevHistory) => [...prevHistory, botMessage]);
        } catch (err: any) {
            console.error('Lỗi khi gửi tin nhắn đến Gemini:', err);
            // Xử lý lỗi từ axios
            if (axios.isAxiosError(err) && err.response) {
                setError(`Đã xảy ra lỗi khi giao tiếp với AI: ${err.response.data.error?.message || 'Lỗi không xác định.'}`);
                Alert.alert('Lỗi', `Đã xảy ra lỗi: ${err.response.data.error?.message || 'Lỗi không xác định.'}`);
            } else {
                setError(`Đã xảy ra lỗi khi giao tiếp với AI: ${err.message}`);
                Alert.alert('Lỗi', `Đã xảy ra lỗi: ${err.message}`);
            }
            // Lọc bỏ tin nhắn người dùng nếu có lỗi để tránh gây hiểu lầm
            setChatHistory((prevHistory) => prevHistory.filter(msg => msg !== userMessage));
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <ScrollView contentContainerStyle={styles.chatContainer}>
                {chatHistory.map((message, index) => (
                    <View
                        key={index}
                        style={[
                            styles.messageBubble,
                            message.role === 'user' ? styles.userBubble : styles.botBubble,
                        ]}
                    >
                        <Text
                            style={
                                message.role === 'user' ? styles.userText : styles.botText
                            }
                        >
                            {message.text}
                        </Text>
                    </View>
                ))}
                {loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#007bff" />
                        <Text style={styles.loadingText}>AI đang trả lời...</Text>
                    </View>
                )}
                {error && <Text style={styles.errorText}>{error}</Text>}
            </ScrollView>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.textInput}
                    placeholder="Nhập tin nhắn của bạn..."
                    value={prompt}
                    onChangeText={setPrompt}
                    multiline={true}
                    editable={!loading}
                />
                <TouchableOpacity
                    style={styles.sendButton}
                    onPress={sendMessage}
                    disabled={loading}
                >
                    <Text style={styles.sendButtonText}>Gửi</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    chatContainer: {
        flexGrow: 1,
        paddingVertical: 10,
        paddingHorizontal: 15,
        justifyContent: 'flex-end',
    },
    messageBubble: {
        padding: 10,
        borderRadius: 8,
        maxWidth: '80%',
        marginBottom: 8,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#dcf8c6',
    },
    botBubble: {
        alignSelf: 'flex-start',
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    userText: {
        color: '#000',
    },
    botText: {
        color: '#333',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
    },
    loadingText: {
        marginLeft: 5,
        color: '#666',
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginTop: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        backgroundColor: '#fff',
    },
    textInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginRight: 10,
        maxHeight: 120,
    },
    sendButton: {
        backgroundColor: '#007bff',
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default AiCreateChatBot;