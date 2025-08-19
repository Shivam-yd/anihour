# Complete cPanel Deployment Guide for Anihour.com

## Your Current Setup
- Domain: anihour.com
- Files location: public_html/anihour.com/flask_app/
- Python version: 3.9
- Flask app files already uploaded

## Step-by-Step Deployment Process

### Step 1: Configure Python Application in cPanel

1. **Login to cPanel** and find **"Python App"** or **"Setup Python App"**
2. **Click "Create Application"**
3. **Fill in these exact settings:**
   - **Python Version:** `3.9` (select highest 3.9.x available)
   - **Application Root:** `/public_html/anihour.com/flask_app`
   - **Application URL:** `anihour.com` (your domain)
   - **Application Startup File:** `passenger_wsgi.py`
   - **Application Entry Point:** `application`
4. **Click "Create"**

### Step 2: Install Required Python Packages

1. **In the Python App interface**, click on your newly created application
2. **Find the "Packages" section** or **"Open Terminal"**
3. **Install these packages one by one:**
   ```bash
   pip install Flask==3.0.3
   pip install Flask-CORS==4.0.1
   pip install requests==2.31.0
   ```
4. **Wait for each installation to complete** before proceeding to the next

### Step 3: Update Configuration Files

**Edit .htaccess file** (replace `yourusername` with your actual cPanel username):
```apache
DirectoryIndex passenger_wsgi.py
PassengerEnabled On
PassengerAppRoot /home/YOUR_ACTUAL_USERNAME/public_html/anihour.com/flask_app
PassengerBaseURI /
PassengerPython /usr/bin/python3.9

RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ passenger_wsgi.py/$1 [QSA,L]
```

**To find your username:**
- Look at the URL in cPanel (usually shows: cpanel.yourdomain.com/user/USERNAME/)
- Or check the file path when you're in File Manager

### Step 4: Set File Permissions

**In cPanel File Manager:**
1. **Select passenger_wsgi.py** → Right-click → **Permissions** → Set to **755**
2. **Select app.py** → Right-click → **Permissions** → Set to **644**
3. **Select main.py** → Right-click → **Permissions** → Set to **644**
4. **Select .htaccess** → Right-click → **Permissions** → Set to **644**
5. **Select templates folder** → Right-click → **Permissions** → Set to **755**
6. **Select static folder** → Right-click → **Permissions** → Set to **755**

### Step 5: Configure Domain Settings

**Option A: If anihour.com should point to the Flask app:**
1. **Go to cPanel → Subdomains** or **Addon Domains**
2. **Set Document Root** for anihour.com to: `/public_html/anihour.com/flask_app`

**Option B: If you want app at a subdirectory:**
- Your app will be available at: `anihour.com/flask_app`

### Step 6: Restart and Test

1. **In Python App interface**, click **"Restart"** button
2. **Wait 2-3 minutes** for the application to start
3. **Visit anihour.com** in your browser
4. **You should see** the anime tracking website with slideshow

### Step 7: Troubleshooting

**If you see "It works!" or directory listing:**
- Check that .htaccess is in the correct folder
- Verify the username in .htaccess matches your cPanel username
- Make sure passenger_wsgi.py has 755 permissions

**If you get Python errors:**
- Check Error Logs in cPanel
- Ensure all packages are installed correctly
- Verify Python 3.9 is selected

**If images don't load:**
- The app fetches from MyAnimeList API - this requires internet access
- Some shared hosts block external API calls

### Step 8: Final Verification

Visit these URLs to test:
- `anihour.com` - Should show homepage with anime slideshow
- `anihour.com/top` - Should show top anime page
- `anihour.com/upcoming` - Should show upcoming anime
- `anihour.com/news` - Should show anime news

## Expected Result
Your anime tracking website will be live with:
- Beautiful slideshow of current anime
- Top anime rankings
- Upcoming anime listings
- Anime news section
- Responsive design that works on mobile and desktop

## Support
If you encounter issues, check:
1. cPanel Error Logs
2. Python App status (should show "Running")
3. File permissions are correct
4. All packages installed successfully