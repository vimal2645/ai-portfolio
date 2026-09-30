from PIL import Image
import os

img_path = r"c:\Users\Anjali Singh\Desktop\cohort\free-claude-code\template\public\Gemini_Generated_Image_ypkhu1ypkhu1ypkh.png"
out_path = r"c:\Users\Anjali Singh\Desktop\cohort\free-claude-code\template\public\resized_avatar.png"

try:
    img = Image.open(img_path)
    img.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
    img.save(out_path)
    print("Successfully resized image to:", img.size)
except Exception as e:
    print("Error:", e)
