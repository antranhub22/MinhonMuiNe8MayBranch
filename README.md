# Mi Nhon Hotel Mui Ne - Voice Assistant

A voice-enabled web application for Mi Nhon Hotel Mui Ne, designed to optimize customer interactions through an intelligent, minimalist service interface with advanced call management and personalized user experience.

## Features

- AI voice interface powered by Vapi.ai
- Real-time conversation transcription
- Multi-language support (English and Vietnamese)
- Automatic service request categorization
- Intuitive, minimalist user interface
- Call history and order tracking
- Support for multiple service requests in a single conversation

## Security and Performance Improvements

### Voice Assistant Integration

- **Secure HTTPS Connection**: All connections to Vapi.ai are secured with HTTPS protocol using TLS 1.2/1.3
- **Optimized Memory Management**: Prevention of memory leaks with efficient event listener management
- **Enhanced Error Handling**: Improved resilience when encountering API or connection issues
- **API Keys Security**: Secure authentication through environment variables, no hardcoding in source code
- **Robust Multi-language Support**: Flexible handling of API keys and assistant IDs for multiple languages

### Integration Testing Tool

The project includes an integration testing tool to verify Vapi.ai connections and functionalities:
```bash
# Run Vapi.ai integration test
ts-node server/vapiTest.ts
```

## Technology Stack

- **Frontend**: React, TypeScript, TailwindCSS
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **AI Services**: OpenAI GPT-4o, Vapi AI
- **Language**: TypeScript/JavaScript

## Getting Started

### System Requirements

- Node.js (v18 or higher)
- PostgreSQL database
- OpenAI API key
- Vapi.ai API key and assistant ID

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/your-username/MiNhon-Hotel-MUiNe.git
   cd MiNhon-Hotel-MUiNe
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   DATABASE_URL=your_postgresql_connection_string
   OPENAI_API_KEY=your_openai_api_key
   VITE_VAPI_PUBLIC_KEY=your_vapi_public_key
   VITE_VAPI_ASSISTANT_ID=your_vapi_assistant_id
   # Optional: configuration for additional languages
   VITE_VAPI_PUBLIC_KEY_FR=your_french_vapi_key
   VITE_VAPI_ASSISTANT_ID_FR=your_french_assistant_id
   VITE_VAPI_PUBLIC_KEY_ZH=your_chinese_vapi_key
   VITE_VAPI_ASSISTANT_ID_ZH=your_chinese_assistant_id
   MS365_EMAIL=your_email_address
   MS365_PASSWORD=your_email_app_password
   ```

4. Update the database schema
   ```bash
   npm run db:push
   ```

5. Start the development server
   ```bash
   npm run dev
   ```

## Usage

The application provides a simple interface for the hotel to:
- Request room service, housekeeping, front desk service, etc.
- Get information about hotel amenities, local attractions, and more
- Create special requests or arrangements
- View conversation summaries in either English or Vietnamese
- Send call summaries via email

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is prohibited.

## Contact

For inquiries, please contact: [tuan.ctw@gmail.com](mailto:tuan.ctw@gmail.com)