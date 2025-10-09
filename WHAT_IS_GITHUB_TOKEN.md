# What is a GitHub Personal Access Token?

## 🔐 Simple Explanation

A **Personal Access Token (PAT)** is like a special password that you create specifically for apps and command-line tools to access your GitHub account.

Think of it like this:
- **Your GitHub password** = Master key to your house
- **Personal Access Token** = Temporary key you give to a delivery person

---

## 🤔 Why Can't We Use Regular Password?

### **GitHub Stopped Accepting Passwords in 2021**

Since **August 13, 2021**, GitHub no longer accepts account passwords for Git operations over HTTPS.

**Old way (doesn't work anymore):**
```
Username: Sarthak030506
Password: your-github-password ❌ REJECTED!
```

**New way (works):**
```
Username: Sarthak030506
Password: ghp_xxxxxxxxxxxxxxxxxxxx ✅ ACCEPTED!
          ↑ This is a Personal Access Token
```

---

## 🎯 Why Did GitHub Make This Change?

### **Security Reasons:**

1. **Passwords are risky**
   - If someone steals your password, they get FULL access to everything
   - Can't track what they did
   - Can't revoke access without changing your entire password

2. **Tokens are safer**
   - You can create multiple tokens for different purposes
   - Each token can have limited permissions
   - You can revoke a token anytime without affecting others
   - You can see when each token was last used
   - Tokens expire (your password doesn't)

---

## 🔑 Real-World Example

Imagine your GitHub account is a bank:

### **Using Password (Old Way)**
```
You: "Here's my bank password to the ATM"
ATM: "Now I can access EVERYTHING in your bank account forever!"
You: "Wait, I only wanted to withdraw $20..."
```

**Problems:**
- ATM has full access forever
- If ATM is compromised, your whole account is at risk
- You can't track what the ATM did
- To revoke access, you must change your bank password everywhere

### **Using Token (New Way)**
```
You: "Here's a special token for the ATM"
Token: "This token can ONLY withdraw money, expires in 90 days"
ATM: "Got it! Limited access for limited time"
```

**Benefits:**
- ATM can only do what you allowed
- Expires automatically after 90 days
- You can cancel this token anytime
- Your main password stays secret
- You can create different tokens for different ATMs

---

## 🛠️ How Personal Access Tokens Work

### **What You're Doing:**

```
1. You create a token on GitHub website
   ↓
2. GitHub generates: ghp_AbCd1234EfGh5678IjKl9012MnOp3456QrSt
   ↓
3. You copy this token
   ↓
4. When Git asks for password, you paste the token
   ↓
5. Git uses this token to push your code
   ↓
6. GitHub verifies the token and allows the push
```

---

## 🔍 Token vs Password Comparison

| Feature | Password | Personal Access Token |
|---------|----------|----------------------|
| **Expiration** | Never expires | Expires after X days |
| **Revokable** | Must change everywhere | Revoke just that token |
| **Permissions** | Full access | Customizable (repo only, read only, etc.) |
| **Multiple** | One password | Many tokens for different apps |
| **Tracking** | Can't track usage | Can see when last used |
| **Security** | If leaked = big problem | If leaked = revoke just that token |

---

## 🎨 What Permissions Can Tokens Have?

When you create a token, you choose what it can do:

### **Common Scopes:**

**repo** (what we need for CosmoStream):
- ✅ Push code
- ✅ Pull code
- ✅ Create repositories
- ✅ Access private repos

**Other scopes** (you can skip these):
- `workflow` - GitHub Actions
- `admin:org` - Manage organizations
- `delete_repo` - Delete repositories
- `read:packages` - Read packages
- etc.

**For CosmoStream, we only need: `repo`**

---

## 📝 Step-by-Step: Creating Your First Token

### **1. Go to Token Settings**
https://github.com/settings/tokens/new

### **2. Fill in the Form**

**Note (Name):**
```
CosmoStream Access
```
*This is just a label so you remember what it's for*

**Expiration:**
```
90 days (recommended)
```
*You can choose: 7 days, 30 days, 60 days, 90 days, 1 year, or No expiration*

**Select Scopes:**
```
✅ repo (Full control of private repositories)
```
*This gives access to push/pull code*

### **3. Generate Token**

Click "Generate token" button at the bottom.

### **4. Copy Token IMMEDIATELY**

You'll see something like:
```
ghp_AbCd1234EfGh5678IjKl9012MnOp3456QrSt
```

**⚠️ IMPORTANT:**
- This is shown ONLY ONCE
- Copy it immediately
- Store it somewhere safe (password manager)
- If you lose it, you must create a new one

### **5. Use Token as Password**

When Git asks:
```
Username for 'https://github.com': Sarthak030506
Password for 'https://Sarthak030506@github.com': ghp_AbCd1234EfGh5678IjKl9012MnOp3456QrSt
```

---

## 💾 Should I Save My Token?

**YES!** Here's where:

### **Option 1: Password Manager (Best)**
- 1Password
- LastPass
- Bitwarden
- Windows Credential Manager

### **Option 2: Text File (Temporary)**
```
# Save in a secure location:
C:\Users\hp\Documents\github-token.txt

Token: ghp_xxxxxxxxxxxxxxxxxxxx
Created: 2025-10-09
Expires: 2026-01-09
Purpose: CosmoStream repository
```

**⚠️ Never:**
- Commit token to Git
- Share in screenshots
- Post publicly
- Email to others

### **Option 3: Git Credential Manager (Automatic)**

Git can remember your token:

```bash
# Store credentials
git config --global credential.helper store

# Next time you push, Git will remember the token
```

---

## 🔄 What Happens When Token Expires?

After 90 days:

1. **Git push fails:**
   ```
   remote: Invalid username or password.
   fatal: Authentication failed
   ```

2. **Create new token:**
   - Go to https://github.com/settings/tokens/new
   - Create new token (same process)
   - Use new token when pushing

**That's it!** Your code is safe, just need new credentials.

---

## 🆘 Token Troubleshooting

### **"I lost my token!"**
- Create a new one (same steps)
- Delete the old one from settings

### **"Token doesn't work"**
- Check it's copied correctly (no spaces)
- Verify it hasn't expired
- Make sure you selected "repo" scope

### **"Git keeps asking for password"**
- Enable credential helper:
  ```bash
  git config --global credential.helper store
  ```

### **"I accidentally committed my token!"**
- **IMMEDIATELY** revoke it on GitHub
- Create a new token
- Never commit tokens to Git

---

## 🎓 Key Takeaways

**What is a token?**
→ A special password for apps/command-line tools

**Why not regular password?**
→ GitHub doesn't accept passwords anymore (security)

**Is it safe?**
→ Yes! Safer than passwords because:
  - Limited permissions
  - Can be revoked anytime
  - Expires automatically
  - Trackable usage

**Do I need it for CosmoStream?**
→ Yes! To push your code to GitHub

**How to create?**
→ https://github.com/settings/tokens/new
→ Check "repo" scope
→ Copy the generated token
→ Use it when Git asks for password

**How long does it last?**
→ You choose: 7 days to 1 year (recommend 90 days)

---

## 🚀 Ready to Create Your Token?

1. **Go to**: https://github.com/settings/tokens/new
2. **Name**: "CosmoStream Access"
3. **Expiration**: 90 days
4. **Scope**: ✅ repo
5. **Generate** and **Copy**
6. **Use it** when pushing code

**That's it!** Your code will be on GitHub! 🎉

---

## 🔗 Official Documentation

- [GitHub Tokens Docs](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [Why Tokens?](https://github.blog/2020-12-15-token-authentication-requirements-for-git-operations/)

---

**Still confused? Think of it as:**
- Your GitHub password = Master key 🔐
- Personal Access Token = Temporary guest pass 🎫
