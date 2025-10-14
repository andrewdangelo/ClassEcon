# MongoDB Not Running - Quick Fix

## Issue
The script is timing out because MongoDB is not running or not accessible.

## Solution 1: Start MongoDB

### On Windows:

**Option A: MongoDB as a Service**
```bash
# Start MongoDB service
net start MongoDB
```

**Option B: Start MongoDB manually**
```bash
# Find where MongoDB is installed, usually:
# C:\Program Files\MongoDB\Server\{version}\bin\mongod.exe

# Start it with:
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath "C:\data\db"
```

**Option C: Using MongoDB Compass**
1. Open MongoDB Compass
2. Click "Connect" with default settings (mongodb://localhost:27017)
3. If it connects, MongoDB is running!

### Check if MongoDB is Running:

Try these commands:
```bash
# Check service status (Windows)
sc query MongoDB

# Or try connecting with the mongo shell
mongo --version
mongosh --version
```

## Solution 2: Use MongoDB Compass (No Script Needed!)

Since MongoDB CLI might not be in your PATH, the easiest way is:

### Steps:
1. **Open MongoDB Compass**
2. **Connect** to `mongodb://localhost:27017`
3. **Select Database**: `classecon`
4. **Select Collection**: `betaaccesscodes`
5. **Click** "Add Data" → "Insert Document"
6. **Paste** this:
   ```json
   {
     "code": "TESTCODE",
     "description": "My first beta code",
     "maxUses": 10,
     "currentUses": 0,
     "isActive": true,
     "usedBy": [],
     "createdAt": {"$date": "2024-10-14T00:00:00.000Z"}
   }
   ```
7. **Click** "Insert"

Done! You now have a beta code: **TESTCODE**

## Solution 3: Create via Backend API

Once your backend is running, you can use the admin UI:

1. Start backend: `cd Backend && npm run dev`
2. Start frontend: `cd Frontend && npm run dev`
3. Login as a teacher
4. Go to: http://localhost:5174/admin/beta-codes
5. Create code through the UI

## Solution 4: Direct Database Insert (If MongoDB is Running)

If MongoDB is running but the script still fails, try this directly in a terminal:

```bash
# Using mongosh (newer version)
mongosh classecon --eval 'db.betaaccesscodes.insertOne({code:"TESTCODE",description:"Test",maxUses:10,currentUses:0,isActive:true,usedBy:[],createdAt:new Date()})'

# Using mongo (older version)
mongo classecon --eval 'db.betaaccesscodes.insertOne({code:"TESTCODE",description:"Test",maxUses:10,currentUses:0,isActive:true,usedBy:[],createdAt:new Date()})'
```

## Verify It Worked

After creating a code using any method above:

### Using MongoDB Compass:
1. Refresh the `betaaccesscodes` collection
2. You should see your code

### Using the Script:
```bash
cd Backend
npm run dev
```

Then go to the landing page and try entering "TESTCODE"

## Troubleshooting

### "Connection timed out"
- MongoDB is not running
- Check Windows Services for "MongoDB"
- Try starting it: `net start MongoDB`

### "Collection not found"
- That's OK! MongoDB will create it automatically
- Just insert the document and it will create the collection

### Still not working?
Use **MongoDB Compass** - it's the most reliable and visual way:
1. Install MongoDB Compass if you haven't
2. Connect to localhost:27017
3. Manually insert the beta code
4. Test on the landing page

## Quick Test After Creating Code

1. Open landing page: http://localhost:3000
2. Click "Sign In"
3. Enter: `TESTCODE` (or whatever code you created)
4. Click "Verify Access"
5. Should redirect to main app! 🎉
