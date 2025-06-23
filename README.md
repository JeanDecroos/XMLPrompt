# XML Prompter - AI-Enhanced Edition

A modern, user-friendly web application that helps users generate optimized XML prompts for Claude Sonnet with intelligent AI-powered enhancement. This app acts as an advanced prompt engineering assistant, transforming basic input into professional, effective prompts.

## Features

### 🚀 **Core Functionality**
- **Role-based Prompts**: Choose from 10 predefined professional roles (Developer, Marketer, Designer, etc.)
- **Structured Input**: Organized form with fields for task description, context, requirements, style guidelines, and output format
- **Live Preview**: Real-time XML prompt generation as you type

### ✨ **AI Enhancement Features**
- **Intelligent Prompt Enrichment**: AI-powered optimization that transforms basic prompts into detailed, effective instructions
- **Tone Optimization**: Select from multiple tone options (professional, friendly, analytical, etc.) for automatic style enhancement
- **Goal-Driven Enhancement**: Specify objectives to align prompt optimization with your specific goals
- **Constraint Integration**: Add and manage constraints that are intelligently woven into the enhanced prompt
- **Example Integration**: Provide references that guide the enhancement process

### 🎯 **Advanced UI/UX**
- **Side-by-Side Comparison**: View original input alongside AI-enhanced output
- **Multiple View Modes**: Switch between comparison, enriched-only, and original views
- **Real-time Enhancement**: Watch as your prompts are optimized in real-time
- **Copy to Clipboard**: One-click copying of both original and enhanced prompts
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### 🔧 **Technical Features**
- **Extensible Architecture**: Built to support additional AI models (GPT, Gemini, etc.) in the future
- **Mock Enhancement Engine**: Intelligent enhancement logic with placeholder for real AI API integration
- **Modular Design**: Clean separation between enhancement logic and UI components

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd XMLPrompter
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

### Basic Prompt Creation
1. **Select a Role**: Choose from the dropdown menu of professional roles
2. **Describe the Task**: Provide a clear, specific description of what you want Claude to do
3. **Add Context** (Optional): Include background information or situational context
4. **Specify Requirements** (Optional): List any constraints or criteria that must be met
5. **Set Style Guidelines** (Optional): Define tone, writing style, or format preferences
6. **Define Output Format** (Optional): Describe the desired output structure

### AI Enhancement (Optional but Recommended)
7. **Select Tone**: Choose from professional, friendly, analytical, persuasive, etc.
8. **Define Goals**: Specify what you want to achieve with this prompt
9. **Add Examples**: Provide references or formats you'd like Claude to follow
10. **Set Constraints**: Add specific limitations (length, format, audience, timeline)
11. **Watch the Magic**: See your basic prompt transform into an optimized, professional prompt

### Final Steps
12. **Compare Views**: Switch between original and enhanced prompts to see the improvements
13. **Copy Enhanced Prompt**: Use the copy button to get the AI-optimized XML prompt for Claude Sonnet

## Project Structure

```
src/
├── components/          # React components
│   ├── Header.jsx      # Application header
│   ├── Footer.jsx      # Application footer
│   ├── PromptGenerator.jsx  # Main generator component
│   ├── PromptForm.jsx  # Form for input fields
│   └── PromptPreview.jsx    # Preview and copy functionality
├── data/
│   └── roles.js        # Predefined roles data
├── utils/
│   └── promptGenerator.js   # Prompt generation logic
├── App.jsx             # Main application component
├── main.jsx           # Application entry point
└── index.css          # Global styles with Tailwind
```

## Technologies Used

- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful, customizable icons
- **ESLint**: Code linting and formatting

## Extensibility

The application is designed to be easily extensible:

### Adding New Roles

Edit `src/data/roles.js` to add new professional roles:

```javascript
{
  id: 'new_role',
  name: 'New Role Name',
  description: 'Description of the role and its expertise'
}
```

### Supporting Additional AI Models

The prompt generation logic is modular. To add support for other AI models:

1. Create new generator functions in `src/utils/promptGenerator.js`
2. Add model selection to the UI
3. Implement model-specific XML/prompt formats

### Customizing Prompt Structure

Modify the `generateClaudePrompt` function in `src/utils/promptGenerator.js` to adjust the XML structure or add new sections.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with modern web technologies for optimal user experience
- Designed with accessibility and usability in mind
- Optimized for prompt engineering best practices with Claude Sonnet 