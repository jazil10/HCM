import mongoose from 'mongoose';
import InternshipProgram from '../models/InternshipProgram';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const updateInternshipPrograms = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hcm_system');
    console.log('Connected to MongoDB');

    // Find all internship programs
    const programs = await InternshipProgram.find({});
    console.log(`Found ${programs.length} internship programs`);

    let updatedCount = 0;

    for (const program of programs) {
      let needsUpdate = false;
      const updates: any = {};

      // Ensure requiredFields contains core academic fields
      const currentRequiredFields = program.applicationForm?.requiredFields || [];
      const coreRequiredFields = ['name', 'email', 'phone', 'university', 'major', 'graduationYear', 'resume'];
      
      // Add missing core fields
      const missingCoreFields = coreRequiredFields.filter(field => !currentRequiredFields.includes(field));
      
      if (missingCoreFields.length > 0) {
        const newRequiredFields = [...new Set([...currentRequiredFields, ...missingCoreFields])];
        updates['applicationForm.requiredFields'] = newRequiredFields;
        needsUpdate = true;
        console.log(`Program "${program.title}" missing core fields: ${missingCoreFields.join(', ')}`);
      }

      // Ensure optionalFields is set
      if (!program.applicationForm?.optionalFields) {
        updates['applicationForm.optionalFields'] = ['gpa', 'coverLetter', 'portfolio', 'linkedIn', 'github'];
        needsUpdate = true;
      }

      // Ensure customQuestions is set
      if (!program.applicationForm?.customQuestions) {
        updates['applicationForm.customQuestions'] = [];
        needsUpdate = true;
      }

      if (needsUpdate) {
        await InternshipProgram.findByIdAndUpdate(program._id, { $set: updates });
        updatedCount++;
        console.log(`Updated program: ${program.title}`);
      }
    }

    console.log(`\nUpdate complete. ${updatedCount} programs updated.`);
    
  } catch (error) {
    console.error('Error updating internship programs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the update if this script is executed directly
if (require.main === module) {
  updateInternshipPrograms()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default updateInternshipPrograms;
