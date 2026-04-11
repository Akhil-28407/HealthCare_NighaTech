const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const dbUri = 'mongodb://localhost:27017/healthcare'; // Verify this from config if possible

async function verify() {
  try {
    await mongoose.connect(dbUri);
    console.log('Connected to DB');
    
    const UserSchema = new mongoose.Schema({
      email: String,
      role: String,
      password: { type: String, select: true }
    }, { strict: false });
    
    const User = mongoose.model('User', UserSchema);
    
    const admin = await User.findOne({ email: 'admin@nighatech.com' });
    if (!admin) {
      console.log('Admin user NOT found in DB');
    } else {
      console.log('Admin user found:', admin.email, 'Role:', admin.role);
      const isMatch = await bcrypt.compare('admin@123', admin.password);
      console.log('Password match:', isMatch);
    }
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

verify();
