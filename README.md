# Video Streaming Website with Adsterra Integration

A Next.js video streaming website with Cloudinary video hosting and Adsterra ad integration.

## Features

- 🎥 **Video Streaming**: Random video/image playback from Cloudinary
- 📱 **Responsive Design**: Mobile-friendly video player with modern UI
- 🎯 **Ad Integration**: Adsterra popup ads between videos
- 🔐 **Admin Panel**: Secure upload system for videos and images
- 📊 **Feed View**: Facebook-style scrollable feed
- 🎮 **Player Controls**: Play/pause, seek, download, share functionality

## Quick Start

### 1. Clone and Install
```bash
git clone https://github.com/mdsaif2022/add-vid.git
cd add-vid
npm install
```

### 2. Environment Setup
Create `.env.local` file:
```env
CLOUDINARY_URL=cloudinary://your_api_key:your_api_secret@your_cloud_name
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Deploy to Vercel
```bash
npm run build
# Push to GitHub, then connect to Vercel
```

## Adsterra Configuration

### Current Setup
The website includes a robust ad system with multiple fallback methods:

1. **Primary Method**: Direct script injection
2. **Fallback Method**: Iframe loading
3. **Final Fallback**: Custom advertisement message

### Updating Ad Scripts

Edit `lib/adConfig.ts` to update your ad networks:

```typescript
export const AD_CONFIG = {
  adsterra: {
    script: 'https://your-adsterra-script.js',
    enabled: true,
    priority: 1
  },
  // Add more networks...
};
```

### Testing Ads

1. **Test Page**: Visit `/test-ad` to manually test ad loading
2. **Console Logs**: Check browser console for detailed ad loading logs
3. **Debug Mode**: Development mode shows current ad method and status

## Admin Panel

- **URL**: `/add-vid`
- **Password**: `admin123`
- **Features**: Upload videos/images with captions and descriptions

## Video Player Features

- **Auto-play**: Videos start automatically
- **Controls**: Play/pause, seek forward/backward
- **Mobile-friendly**: Touch controls and responsive design
- **Download**: Download videos directly
- **Share**: Share to social media platforms
- **Ad Integration**: Ads show between video sequences

## Ad Sequence

The website follows this ad pattern:
1. **1 Video** → Ad → **2 Videos** → Ad → **2 Videos** → Ad → (repeat)

## Troubleshooting

### Ads Not Showing
1. Check browser console for error messages
2. Disable ad blockers temporarily
3. Verify Adsterra account is active
4. Update script URLs in `lib/adConfig.ts`

### Videos Not Loading
1. Check Cloudinary credentials in `.env.local`
2. Verify videos are uploaded to correct folder
3. Check browser console for API errors

### Upload Issues
1. Check file size limits (100MB videos, 10MB images)
2. Verify Cloudinary configuration
3. Check admin panel authentication

## File Structure

```
├── app/
│   ├── page.tsx              # Main video player page
│   ├── add-vid/page.tsx      # Admin panel
│   ├── feed/page.tsx         # Feed view
│   ├── test-ad/page.tsx      # Ad testing page
│   └── api/                   # API routes
├── components/
│   ├── VideoPlayer.tsx       # Main video player
│   ├── AdModal.tsx          # Ad integration
│   └── MediaUploadForm.tsx  # Upload form
├── lib/
│   ├── cloudinary.ts         # Cloudinary integration
│   └── adConfig.ts          # Ad configuration
└── hooks/
    └── useVideoAdCycle.ts    # Video/ad cycle logic
```

## Environment Variables

Required for Vercel deployment:
- `CLOUDINARY_URL`: Your Cloudinary connection string

## Support

For issues with:
- **Adsterra**: Check Adsterra dashboard and support
- **Cloudinary**: Verify credentials and folder structure
- **Deployment**: Check Vercel logs and environment variables

## License

This project is for educational and commercial use.