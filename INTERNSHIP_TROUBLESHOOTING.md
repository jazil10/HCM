# Internship Program Status Troubleshooting Guide

## Issue: Program shows as "Draft" even when set to "Active"

### Step 1: Check the Form Submission
1. Open browser developer tools (F12)
2. Go to Network tab
3. Create a new program and set status to "Active"
4. Look for the POST request to `/internship-programs`
5. Check the request payload - ensure `status: "active"` is being sent

### Step 2: Check Backend Response
1. In the Network tab, check the response from the create program request
2. Look for the `status` field in the response
3. If it shows `"draft"` instead of `"active"`, there's a backend issue

### Step 3: Check Database (if you have access)
```javascript
// In MongoDB shell or compass
db.internshipprograms.find({}, {title: 1, status: 1, publicSlug: 1})
```

### Step 4: Test Public URL Access
1. Create a program with status "Active"
2. Copy the public URL from the program details page
3. Open the URL in an incognito/private window
4. If you get "Program not found", the status might not be saved correctly

### Step 5: Manual Status Update
If the program is stuck in Draft:
1. Go to the program details page
2. Click "Edit"
3. Change status to "Active"
4. Save changes
5. Check if the public URL works now

### Step 6: Check Application Deadline
The system prevents setting status to ACTIVE if:
- Application deadline is in the past
- Required fields are missing

### Common Solutions:
1. **Clear browser cache** and try again
2. **Check console errors** in browser developer tools
3. **Restart the backend server** to pick up any model changes
4. **Set a future application deadline** before setting status to Active

### Debug Commands:
```bash
# In backend directory
npm run dev

# Check backend logs for any errors during program creation
```

### Quick Test:
1. Create program with all fields filled
2. Set deadline to tomorrow's date
3. Set status to "Active"
4. Save and check if public URL works

If the issue persists, check the backend logs for validation errors or database connection issues.
