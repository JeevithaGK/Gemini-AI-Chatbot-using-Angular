import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService } from '../../services/chatbot.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css']
})
export class ChatComponent {
  userMessage: string = '';
  messages: { sender: string; text: string }[] = [];

  constructor(private chatbotService: ChatbotService) {}

  sendMessage() {
    if (!this.userMessage.trim()) return;

    this.messages.push({ sender: 'user', text: this.userMessage });

    this.chatbotService.sendMessage(this.userMessage).subscribe({
      next: (res: { response: string }) => {
        const reply = res.response?.trim() || "🤖 I didn’t catch that.";
        this.messages.push({ sender: 'bot', text: reply });
      },
      error: () => {
        this.messages.push({ sender: 'bot', text: '⚠️ Error connecting to AI' });
      }
    });

    this.userMessage = '';
  }
}
