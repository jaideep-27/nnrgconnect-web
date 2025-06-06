require('dotenv').config({ path: '../.env' }); // Go up one level to find .env
const mongoose = require('mongoose');
const fs = require('fs').promises; // Use promise-based fs for async/await
const path = require('path');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Adjust path to User model

const DATABASE_DIR = path.join(__dirname, '..', '..', 'database'); // Path to the /database directory
const DEFAULT_PASSWORD = 'password123'; // Default password for seeded users
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'adminpassword'; // Choose a strong password for the admin

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for Seeding...');

    // --- Create/Update Admin User ---
    console.log('\nCreating/Updating Admin User...');
    const adminSalt = await bcrypt.genSalt(10);
    const adminHashedPassword = await bcrypt.hash(ADMIN_PASSWORD, adminSalt);

    const adminUserData = {
      fullName: 'Administrator',
      email: ADMIN_EMAIL,
      phoneNumber: '0000000000', // Placeholder phone
      rollNumber: 'ADMIN001',   // Placeholder roll number
      password: adminHashedPassword,
      collegeIdCardImage: '/uploads/id_cards/admin_placeholder_id.png', // Placeholder ID
      isApproved: true,
      isAdmin: true,
      approvedAt: Date.now(),
    };

    const adminUser = await User.findOneAndUpdate(
      { email: ADMIN_EMAIL },
      { $set: adminUserData },
      { upsert: true, new: true, runValidators: true }
    );
    console.log(`Admin user ${adminUser.email} ensured with isAdmin: ${adminUser.isAdmin}.`);
    console.log(`IMPORTANT: The default admin password is: ${ADMIN_PASSWORD}`);
    // --- End Admin User ---

    // Optional: Clear existing non-admin users (be careful with this in production)
    // await User.deleteMany({ isAdmin: false });
    // console.log('Cleared existing non-admin users.');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, salt);

    const files = await fs.readdir(DATABASE_DIR);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    if (jsonFiles.length === 0) {
      console.log('No JSON files found in the database directory. Nothing to seed.');
      return;
    }

    let usersSeededCount = 0;
    let usersSkippedCount = 0;

    for (const jsonFile of jsonFiles) {
      console.log(`\nProcessing file: ${jsonFile}...`);
      const filePath = path.join(DATABASE_DIR, jsonFile);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      let studentsData = [];
      try {
        studentsData = JSON.parse(fileContent);
      } catch (parseError) {
        console.warn(`Skipping ${jsonFile}: Could not parse JSON. Error: ${parseError.message}`);
        continue;
      }
      
      if (!Array.isArray(studentsData)) {
        console.warn(`Skipping ${jsonFile}: content is not an array.`);
        continue;
      }

      for (const student of studentsData) {
        // Normalize field names
        const rollNumber = student['Roll Number'] || student.rollNumber;
        const fullName = student['Name of the Student (As per SSC)'] || student['Name of the Student'] || student.fullName;
        const email = student['E-mail ID of the Student'] || student.email;
        const phoneNumber = student['Mobile No. of the Student'] || student['Student Mobile'] || student.phoneNumber;
        
        // Convert phoneNumber to string if it's a number
        const finalPhoneNumber = phoneNumber ? String(phoneNumber).trim() : null;
        let finalEmail = email ? String(email).trim().toLowerCase() : null; // Make finalEmail mutable
        const finalFullName = fullName ? String(fullName).trim() : null;
        const finalRollNumber = rollNumber ? String(rollNumber).trim().toUpperCase() : null;

        // Generate placeholder email if email is missing but roll number is present
        if (!finalEmail && finalRollNumber) {
          finalEmail = `${finalRollNumber.toLowerCase()}@nnrgtemp.com`;
          console.log(`INFO: Generated placeholder email for ${finalFullName || finalRollNumber}: ${finalEmail}`);
        }

        // Basic validation for core required fields after normalization AND placeholder email generation
        if (!finalFullName || !finalEmail || !finalRollNumber || !finalPhoneNumber) {
          console.warn(
            `Skipping student due to missing core fields in ${jsonFile} (after normalization): ` +
            `Name: ${finalFullName || 'Missing'}, Email: ${finalEmail || 'Missing'}, ` +
            `Roll: ${finalRollNumber || 'Missing'}, Phone: ${finalPhoneNumber || 'Missing'}. Original data:`, student
          );
          usersSkippedCount++;
          continue;
        }

        try {
          const existingUser = await User.findOne({ 
            $or: [{ email: finalEmail }, { rollNumber: finalRollNumber }]
          });

          if (existingUser) {
            console.log(`User with email ${finalEmail} or roll number ${finalRollNumber} already exists. Skipping.`);
            usersSkippedCount++;
            continue;
          }

          const newUser = new User({
            fullName: finalFullName,
            email: finalEmail, // This will now use the placeholder if original was missing
            phoneNumber: finalPhoneNumber,
            rollNumber: finalRollNumber,
            password: hashedPassword,
            collegeIdCardImage: student.collegeIdCardImage || '/uploads/id_cards/placeholder_id.png',
            isApproved: true,
            isAdmin: student.isAdmin || false,
            approvedAt: Date.now(),
          });

          await newUser.save();
          usersSeededCount++;
          // console.log(`Seeded user: ${newUser.fullName} (${newUser.rollNumber})`);

        } catch (indErr) {
          console.error(`Error seeding individual student ${finalRollNumber || finalEmail} from ${jsonFile}:`, indErr.message);
          usersSkippedCount++;
        }
      }
    }

    console.log(`\n--------------------------------------------------`);
    console.log(`Database seeding completed.`);
    console.log(`${usersSeededCount} new users seeded successfully.`);
    console.log(`${usersSkippedCount} users were skipped (due to missing fields, duplicates, or errors).`);
    console.log(`Default password for newly seeded student users: ${DEFAULT_PASSWORD}`);
    // console.log(`REMEMBER: Users should change this default password upon first login!`); // Commented out as admin password is now shown
    console.log(`--------------------------------------------------`);

  } catch (error) {
    console.error('Error during database seeding process:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB Disconnected after Seeding.');
  }
};

seedDatabase(); 