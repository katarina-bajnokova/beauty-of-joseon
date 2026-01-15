# 🤖 AI Skincare Advisor Setup Guide

## ✅ What's Been Added

Your Beauty of Joseon site now has an **AI-powered skincare advisor chatbot** using Google Gemini!

### Features:

- 💬 **Natural Conversation** - Chat with AI about your skin analysis
- 🎯 **Context-Aware** - Knows your analysis results and recommends accordingly
- ✨ **Personalized Advice** - Tailored to your specific skin type
- 📱 **Beautiful UI** - Floating chat button with smooth animations
- 🆓 **Free to Use** - Google Gemini free tier (60 requests/min)

---

## 🔑 Step 1: Get Your Free Gemini API Key

1. **Visit Google AI Studio:**

   ```
   https://makersuite.google.com/app/apikey
   ```

2. **Click "Create API Key"**
   - Sign in with your Google account
   - Accept terms of service
   - Copy your API key

3. **Add to `.env` file:**
   - Open the `.env` file in your project root
   - Replace `your_actual_key_here` with your real API key:

   ```
   VITE_GEMINI_API_KEY=AIzaSyC_your_actual_key_here
   ```

4. **Restart your dev server:**
   ```bash
   npm run dev
   ```

---

## 🎮 How to Use

1. **Navigate to Skin Analysis section** on your website
2. **Upload a face photo** and wait for analysis
3. **Click the chat button** (floating button bottom-right)
4. **Ask questions** like:
   - "What does my skin analysis mean?"
   - "What products should I use?"
   - "Explain my T-zone oiliness"
   - "Korean skincare routine for my skin type"

### Quick Question Buttons

When you first open the chat, you'll see 4 quick question buttons you can click instantly!

---

## 📁 Files Created

```
src/components/sections/SkinAnalysis/
├── AISkinAdvisor.jsx              ← Chat UI component
├── AISkinAdvisor.module.scss      ← Chat styling
├── useGeminiChat.js               ← API integration hook
└── SkinAnalysis.jsx               ← Updated (chatbot added)

.env                                ← Your API key (KEEP SECRET!)
.env.example                        ← Template for others
```

---

## 🎨 What It Does

### 1. **Context-Aware Responses**

The AI knows:

- Your overall skin score
- Your specific analysis metrics (smoothness, regional analysis)
- Your recommended products
- Your skin type (oily T-zone, dry cheeks, etc.)

### 2. **Beauty of Joseon Expert**

The AI is trained to:

- Explain Korean skincare concepts
- Recommend Beauty of Joseon products
- Create personalized routines
- Answer ingredient questions

### 3. **Smart Conversations**

- Maintains chat history during session
- Typing indicators
- Error handling with friendly messages
- Mobile-responsive design

---

## 🔒 Security Notes

**IMPORTANT:**

- ✅ `.env` is in `.gitignore` (your key stays private)
- ✅ `.env.example` is safe to commit (no real key)
- ❌ **NEVER commit your real API key to GitHub**

---

## 💰 API Costs (Free Tier)

**Google Gemini Free Tier:**

- 60 requests per minute
- Perfect for personal projects and demos
- No credit card required

**If you exceed limits:**

- Users will see friendly error message
- App continues to work (just no AI chat temporarily)

---

## 🐛 Troubleshooting

### "API key not configured" error

- Check `.env` file exists in project root
- Verify `VITE_GEMINI_API_KEY=` is set correctly
- Restart dev server: `npm run dev`

### Chat button doesn't appear

- Check browser console for errors
- Verify all files were created correctly
- Clear browser cache

### AI responses seem generic

- Upload and analyze a photo first
- The AI needs analysis data for personalized advice
- Try asking specific questions about your results

### "Quota exceeded" error

- You've hit the 60 requests/min limit
- Wait 1 minute and try again
- Consider upgrading to paid plan if needed (optional)

---

## 🎯 Testing Checklist

- [ ] API key added to `.env`
- [ ] Dev server restarted
- [ ] Chat button appears (bottom-right)
- [ ] Can click chat button to open window
- [ ] Can type and send messages
- [ ] AI responds with relevant advice
- [ ] Quick question buttons work
- [ ] Chat closes properly
- [ ] Works on mobile view

---

## 🚀 Next Steps

1. **Get your API key** (5 minutes)
2. **Add to `.env`** (1 minute)
3. **Test the chatbot** (2 minutes)
4. **Show it off!** 🎉

Your project now has:
✅ Computer Vision (MediaPipe face detection)
✅ LLM Integration (Google Gemini chatbot)
✅ Modern animations (GSAP, Framer Motion, Three.js)

**This exceeds all your project requirements!**

---

## 📚 API Documentation

- **Google Gemini:** https://ai.google.dev/docs
- **Free API Key:** https://makersuite.google.com/app/apikey
- **Rate Limits:** https://ai.google.dev/pricing

---

## ✨ Pro Tips

1. **Clear chat** - Click trash icon to start fresh conversation
2. **Ask follow-ups** - The AI remembers context during session
3. **Be specific** - Reference your analysis scores for better advice
4. **Mobile friendly** - Works great on phones too!

**Enjoy your new AI skincare advisor!** 🌸
