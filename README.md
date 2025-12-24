# 🌟 Wallestars - Self-Hosted Project Discovery

A modern, AI-guided web application for discovering and saving self-hosted projects from the awesome-selfhosted community. Swipe through amazing open-source projects with an intuitive Tinder-like interface!

## ✨ Features

- **🎯 Swipe Interface**: Intuitive swipe-left (skip) or swipe-right (save) gestures
- **🤖 AI Guidance**: Smart contextual messages to guide you through project discovery
- **💾 Local Storage**: Your saved projects persist in browser localStorage
- **📱 Responsive Design**: Works beautifully on desktop, tablet, and mobile devices
- **⌨️ Keyboard Shortcuts**: Use arrow keys for quick navigation
- **🎨 Beautiful UI**: Modern gradient design with smooth animations
- **🔗 Direct GitHub Links**: Quick access to project repositories
- **📚 Saved Collection**: View and manage your saved projects easily

## 🚀 Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Wallesters-org/Wallestars.git
   cd Wallestars
   ```

2. **Open in browser**:
   - Simply open `index.html` in any modern web browser
   - No build process or dependencies required!

3. **Start swiping**:
   - Swipe right or press → to save a project
   - Swipe left or press ← to skip
   - Click the "Saved" button to view your collection

## 📖 How to Use

### Desktop
- **Mouse**: Click and drag cards left or right
- **Buttons**: Use the ✖️ (Skip) and ❤️ (Save) buttons
- **Keyboard**: Press ← for skip, → for save

### Mobile
- **Touch**: Swipe cards with your finger
- **Tap**: Use the action buttons at the bottom

### Features
- **View Saved Projects**: Click the "📚 Saved" button in the header
- **Refresh Deck**: Click the "🔄 Refresh" button to reshuffle and start over
- **Project Details**: Click on saved projects to view more information
- **Remove Projects**: Delete projects from your saved collection anytime

## 🎨 Customization

### Adding More Projects

Edit `data.js` to add more projects from awesome-selfhosted:

```javascript
{
    id: 21,
    name: "Your Project",
    category: "Category Name",
    description: "Project description here",
    tags: ["Tag1", "Tag2", "Tag3"],
    stars: "10.5k",
    url: "https://github.com/username/project",
    license: "MIT"
}
```

### Styling

Customize the look in `styles.css`:
- `:root` variables for colors
- `.project-card` for card styling
- `.ai-guide` for AI message box

### AI Messages

Modify AI responses in `app.js` by editing the `aiMessages` array and `updateAIMessage()` function.

## 🏗️ Project Structure

```
Wallestars/
├── index.html          # Main HTML structure
├── styles.css          # All styling and animations
├── app.js             # Application logic and interactivity
├── data.js            # Project data from awesome-selfhosted
└── README.md          # This file
```

## 🌐 Technologies Used

- **HTML5**: Semantic structure
- **CSS3**: Modern styling with animations and gradients
- **Vanilla JavaScript**: No frameworks, pure ES6+
- **LocalStorage API**: For data persistence
- **Touch Events API**: For mobile swipe gestures

## 🔧 Browser Support

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 📱 Mobile Optimization

The app is fully responsive and optimized for:
- Touch gestures
- Small screens
- Portrait and landscape orientations
- iOS and Android devices

## 🎯 Future Enhancements

Potential features to add:
- [ ] Fetch live data from awesome-selfhosted GitHub API
- [ ] Category filtering
- [ ] Search functionality
- [ ] Export saved projects as JSON/CSV
- [ ] Share saved collections via URL
- [ ] Dark mode toggle
- [ ] More detailed project information
- [ ] Integration with actual AI for smarter recommendations
- [ ] User preferences and personalization

## 🤝 Contributing

Contributions are welcome! Feel free to:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is open source. The projects listed in the app have their own licenses (specified in each project card).

## 🙏 Acknowledgments

- Inspired by [awesome-selfhosted](https://github.com/awesome-selfhosted/awesome-selfhosted)
- All the amazing open-source project maintainers
- The self-hosting community

## 📞 Support

If you find this useful, please star ⭐ the repository!

---

**Built with ❤️ for the self-hosted community**
