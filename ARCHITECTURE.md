# ALIKE-ND System Architecture & Data Persistence Guide
(Remix: Niyon | Lead Architecture: ALIKE-ND Platform)

## ১. ডাটা হারিয়ে যাওয়ার কারণ ও তার স্থায়ী সমাধান (Data Persistence Architecture)

ওয়েবসাইট আপডেট বা পুনর্নিমাণ (Re-deploy) করার পর ডাটা বা ইউজার টোকেন ডিলিট বা মুছে যাওয়ার প্রধান কারণ হলো Stateless Infrastructure ব্যবহার করা। এটি রোধ করতে নিচের আর্কিটেকচার অনুসরন করা বাধ্যতামূলক:

### ক. ডাটাবেস সংরক্ষণ (Database Persistence)
- **সমাধান:** সোর্স কোড (Source Code) থেকে ডাটাবেসকে সম্পূর্ণ আলাদা রাখা।
- **পদ্ধতি:** PostgreSQL / MongoDB / MySQL-এর জন্য Managed Cloud Database (যেমন: MongoDB Atlas, Supabase, Neon) ব্যবহার করা হয়েছে। কোড আপডেট বা ডেপ্লয় করলেও ক্লাউড ডাটাবেসের তথ্যে কোনো প্রভাব পড়ে না।
- **ডিরেক্টিভ:** `.env` ও `.env.example`-এ থাকা `MONGO_URI` এবং `JWT_SECRET` কোনো অবস্থাতেই পরিবর্তন বা ডিলিট করা যাবে না।

### খ. ফাইল ও মিডিয়া আপলোড (Image/Media Storage)
- **সমাধান:** সার্ভারের ক্ষণস্থায়ী লোকাল ফোল্ডারে ইউজারদের আপলোড করা ছবি বা ফাইল স্থায়ী ভাবা যাবে না।
- **পদ্ধতি:** ক্লাউড স্টোরেজ (Cloudinary, AWS S3, অথবা Base64 / Remote CDN URLs) ব্যবহার করে মিডিয়া ফাইল সংরক্ষণ করা হয়।

### গ. ইউজার লগইন ও টোকেন (Authentication & Token Management)
- **সমাধান:** কোড আপডেট বা রিফ্রেশের পরও ইউজার সেশন অক্ষুণ্ণ থাকা।
- **পদ্ধতি:** 
  - ক্লায়েন্ট সাইডে Persistent Storage (`localStorage`) ও হেডার Bearer Token ব্যবহার করা হয় (`alike_user_token`, `alike_seller_token`, `alike_admin_token`)।
  - রিফ্রেশ বা রি-ডেপ্লয়মেন্টের পরও ব্রাউজার টোকেন ধরে রাখে এবং ব্যাকএন্ড `JWT_SECRET` যাচাই করে সেশন চালু রাখে।

---

## ২. AI-এর জন্য কাস্টম প্রম্পট (Prompt Template)

ভবিষ্যতে যেকোনো AI অ্যাসিস্ট্যান্টকে দিয়ে ওয়েবসাইট আপডেট বা নতুন কোনো ফিচার তৈরি করানোর সময় নিচের টেমপ্লেটটি হুবহু কপি করে ব্যবহার করুন:

```text
Please work on my project "ALIKE-ND" (Remix: Niyon).

CRITICAL REQUIREMENTS FOR DATA PERSISTENCE & UPDATES:
1. Preserve Existing Data & Schema:
   - Do NOT clear, rewrite, or break the existing database schema, user data, user sessions, or published posts/projects.
   - All migrations must be non-destructive (additive changes only).
2. Token & Auth Management:
   - Ensure user authentication tokens (JWT / Sessions) are stored securely and remain persistent across re-deployments and app updates so users do not get logged out.
3. Externalized Storage:
   - Ensure all post data, project files, and user content are handled via an external database (e.g., Supabase / MongoDB / PostgreSQL) and cloud storage (e.g., Cloudinary / S3).
4. Scalable & Updatable Architecture:
   - Keep code modular so future features or updates can be merged without affecting existing posts, users, or system state.
5. Environment Protection Rule:
   - DO NOT TOUCH, MODIFY, OR REMOVE MONGO_URI or JWT_SECRET from .env or .env.example.

TASK/FEATURE REQUEST:
[এখানে আপনার নতুন ফিচারের বর্ণনা বা আপডেটের কথা লিখুন]
```

---

## ৩. ভবিষ্যতের জন্য বেস্ট প্র্যাকটিস (Best Practices)

1. **Non-destructive Schema:** ডাটাবেসের স্ট্রাকচার চেঞ্জ করতে হলে সবসময় Additive/Non-destructive পরিবর্তন করুন, যেন পুরনো ডাটা নষ্ট না হয়।
2. **Environment Variables (.env):** ডাটাবেস ইউআরএল, এপিআই কি (API Keys) এবং টোকেন সিক্রেট সবসময় `.env` ফাইলে সংরক্ষিত রাখুন এবং কখনোই এগুলোকে কোড থেকে মুছবেন না।
3. **Session Persistence:** ক্লায়েন্ট ও সার্ভারের টোকেন ভ্যালিডেশন সর্বদা সিঙ্ক রাখুন যাতে রিফ্রেশ বা ডেপ্লয়মেন্টে ইউজার লগআউট না হয়।
