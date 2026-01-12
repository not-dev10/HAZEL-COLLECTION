# 🏠 Home Page Editor - Quick Start Guide

## What Was Added?

A new **Home Page Editor** section in the admin panel where you can edit:
1. ✅ **Carousel slides** - Images, titles, subtitles, button text, and order
2. ✅ **New Arrivals section** - Heading, subheading, and how many products to show
3. ✅ **Bridal Collection section** - All text content, button, image, and visibility
4. ✅ **Collection Banners** - Multiple collections with titles, images, and order

---

## 🚀 How to Access

1. **Log in** to Admin Panel
2. Look at the **left sidebar** and click **"Home Page"** (new menu item with house icon)
3. You'll see **4 tabs**: Carousel, New Arrivals, Bridal, Collections

---

## 📝 How to Use Each Section

### **Carousel (Slide Show at Top)**
- Click the **Carousel** tab
- Each slide shows:
  - **Image Key** - Name of the image file (e.g., `hero-bridal`)
  - **Collection Title** - Main big text (e.g., "Studio Portraits")
  - **Subtitle** - Small text above title (e.g., "Hezal the Label Bridal 2025")
  - **Button Text** - What the button says (e.g., "LIVE NOW")
  - **Display Order** - Number (1 = first, 2 = second, etc.)

- Use ⬆️ and ⬇️ buttons to move slides up/down
- Click **Save Carousel** when done

### **New Arrivals (Product Grid Section)**
- Click the **New Arrivals** tab
- Edit these:
  - **Section Heading** - The big title (default: "New Arrivals")
  - **Section Subheading** - Small text above (default: "Discover Our Collection")
  - **Number of Products** - How many products to show (default: 8)
  - **Visible** - Checkbox to show/hide this whole section
- Click **Save New Arrivals**

### **Bridal (The Pink Section with Model)**
- Click the **Bridal** tab
- Edit:
  - **Visible** - Toggle to show/hide this section
  - **Heading** - Big title (e.g., "Bridal Collection 2025")
  - **Subheading** - Small text (e.g., "The Art of Craftsmanship")
  - **Description** - Long text explaining the collection
  - **Button Text** - What the button says (e.g., "Explore Collection")
  - **Button Link** - Where the button goes (e.g., `/collection/bridals`)
  - **Image Key** - Which image to show (e.g., `editorial-bridal`)
- Click **Save Bridal Section**

### **Collections (Ready To Wear & Unstitched Sections)**
- Click the **Collections** tab
- You'll see 2 collection cards
- For each one, edit:
  - **Title** - Collection name (e.g., "Ready To Wear")
  - **Subtitle** - Small text (e.g., "Effortless Elegance")
  - **Image Key** - Image identifier (e.g., `collection-rtw`)
  - **Link** - Where clicking goes (e.g., `/collection/ready-to-wear`)
  - **Display Order** - Number for ordering
- Use ⬆️ and ⬇️ to reorder collections
- Toggle **Visible** checkbox to show/hide entire section
- Click **Save Collection Banner**

---

## 🎨 Image Key Reference

When editing images, use these keys (don't change these - they're the official image names):

| Image Key | What It Is |
|-----------|-----------|
| `hero-bridal` | Carousel slide 1 (bridal image) |
| `hero-festive` | Carousel slide 2 (festive image) |
| `hero-unstitched` | Carousel slide 3 (unstitched image) |
| `editorial-bridal` | Bridal section image |
| `collection-rtw` | Ready To Wear collection image |
| `collection-unstitched` | Unstitched collection image |

---

## ✨ What Happens When You Save?

✅ Changes are saved to database instantly  
✅ Website refreshes to show new content  
✅ You see a green success message  
✅ All changes persist (they won't disappear)

---

## ❌ If Something Goes Wrong

**If you see a red error message:**
- Try saving again
- Check all fields are filled in
- Make sure you're logged in as admin

**If changes don't appear on website:**
- Refresh the page (Ctrl+R or Cmd+R)
- Check "Visible" checkbox is enabled
- Try clearing browser cache (Ctrl+Shift+Delete)

**If you can't find the Home Page tab:**
- Log out and log back in
- Make sure you're logged in as admin (not customer)
- Check sidebar menu on left side of screen

---

## 📚 Tips & Tricks

✏️ **Reorder slides/collections** - Use up/down arrows, no need to manually change numbers  
🔄 **Preview changes** - Refresh home page in new tab while editing  
💾 **Auto-save** - Each section saves independently, you don't need to save the whole page  
👁️ **Show/Hide sections** - Use "Visible" checkbox to temporarily hide sections  
🔗 **Links must start with /** - e.g., `/collection/bridals` (not just `collection/bridals`)

---

## 🎯 Common Tasks

### "I want to show only 6 new arrival products instead of 8"
1. Go to **New Arrivals** tab
2. Change "Number of Products to Display" to `6`
3. Save

### "I want to hide the Bridal section"
1. Go to **Bridal** tab
2. Uncheck "Show Bridal section"
3. Save

### "I want to swap the order of Ready To Wear and Unstitched collections"
1. Go to **Collections** tab
2. Click ⬇️ arrow on "Ready To Wear" to move it down
3. Save

### "I want to change the carousel slide order"
1. Go to **Carousel** tab
2. Use ⬆️ and ⬇️ arrows to reorder
3. Save

### "I want to change carousel button text from LIVE NOW to SHOP NOW"
1. Go to **Carousel** tab
2. Find "Button Text" field
3. Change it to desired text
4. Save

---

## 🔐 Security Note

Only admin users can edit home page content. Regular customers cannot access this section.

---

## 💡 Still Have Questions?

Check the full documentation: `HOME_PAGE_EDITOR_IMPLEMENTATION.md`

Need help? All changes are reversible - just edit and save again!
