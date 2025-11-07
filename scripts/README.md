# Database Scripts

This directory contains scripts for database maintenance operations.

## Photo URL Cleanup Scripts

### Problem Description
Photo URLs in the database may contain full domain prefixes, for example:
- `https://photograph.ecarry.uk/photos/DJI_0471.jpg`

We need to clean them to keep only the key format:
- `photos/DJI_0471.jpg`

### Script Overview

#### 1. `clean-photo-urls-safe.ts` - Safe Cleanup Script
This is the recommended main script with the following features:
- ✅ Automatic backup file creation
- ✅ Preview of changes to be made
- ✅ User confirmation required before execution
- ✅ Rollback support
- ✅ Result verification

#### 2. `rollback-photo-urls.ts` - Rollback Script
Script for restoring original URLs:
- ✅ Restore data from backup file
- ✅ Show restoration examples
- ✅ User confirmation required
- ✅ Verify restoration results

#### 3. `clean-photo-urls.ts` - Basic Cleanup Script
Simple version of the cleanup script without backup functionality.

### Usage

#### Clean Photo URLs
```bash
# Using npm script (recommended)
npm run clean:photo-urls

# Or run directly
bun tsx scripts/clean-photo-urls-safe.ts
```

#### Rollback Changes
```bash
# Using npm script (recommended)
npm run rollback:photo-urls

# Or run directly
bun tsx scripts/rollback-photo-urls.ts
```

### Execution Flow

1. **Run cleanup script**
   ```bash
   npm run clean:photo-urls
   ```

2. **Script will display**:
   - Number of photos found that need cleaning
   - Examples of URL changes for the first few photos
   - Confirmation prompt

3. **After pressing Enter to confirm**:
   - Create backup file `scripts/photo-urls-backup.json`
   - Execute URL cleanup
   - Display result statistics

4. **If rollback is needed**:
   ```bash
   npm run rollback:photo-urls
   ```

### Safety Features

- 🔒 **Automatic Backup**: Creates backup file before execution
- 🔍 **Preview Function**: Shows examples of changes to be made
- ⚠️ **User Confirmation**: Requires manual confirmation before execution
- 🔄 **Complete Rollback**: Can fully restore to original state
- ✅ **Result Verification**: Verifies changes after execution

### Backup File

Backup file is saved at `scripts/photo-urls-backup.json` and contains:
```json
[
  {
    "id": "photo-uuid",
    "originalUrl": "https://photograph.ecarry.uk/photos/DJI_0471.jpg",
    "cleanedUrl": "photos/DJI_0471.jpg",
    "title": "Photo Title"
  }
]
```

### Important Notes

1. **Environment Variables**: Ensure `DATABASE_URL` is properly configured
2. **Database Connection**: Ensure database is accessible before running scripts
3. **Backup Storage**: Backup files are saved in the `scripts/` directory
4. **Permission Check**: Ensure you have database write permissions

### Troubleshooting

#### Database Connection Failed
```bash
Error: Failed to connect to database
```
- Check `DATABASE_URL` in your `.env` file
- Confirm database service is running

#### Backup File Not Found
```bash
❌ Backup file not found
```
- Run the cleanup script first to create a backup
- Check if `scripts/photo-urls-backup.json` exists

#### Permission Denied
```bash
Error: Permission denied
```
- Check database user permissions
- Confirm you have UPDATE permissions
