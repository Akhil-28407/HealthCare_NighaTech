import * as mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { config } from 'dotenv';
config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/healthcare';

const UserSchema = new mongoose.Schema({
  name: String, email: String, mobile: String, password: String,
  role: String, branchId: mongoose.Types.ObjectId, isActive: { type: Boolean, default: true },
}, { timestamps: true });

const BranchSchema = new mongoose.Schema({
  name: String, address: String, city: String, state: String, pincode: String,
  phone: String, email: String, labName: String, labLicense: String, isActive: { type: Boolean, default: true },
}, { timestamps: true });

const TestMasterSchema = new mongoose.Schema({
  name: String, code: String, category: String, description: String, sampleType: String,
  price: Number, parameters: [{ name: String, unit: String, normalRangeMin: Number, normalRangeMax: Number, normalRangeText: String, method: String }],
  turnaroundTime: String, isActive: { type: Boolean, default: true },
}, { timestamps: true });

const ReportTemplateSchema = new mongoose.Schema({
  name: String, content: String, type: String, description: String,
  isDefault: { type: Boolean, default: false }, isActive: { type: Boolean, default: true },
}, { timestamps: true });

async function seed() {
  console.log('🌱 Starting seed...');
  await mongoose.connect(MONGODB_URI);
  console.log('📦 Connected to MongoDB');

  const User = mongoose.model('User', UserSchema);
  const Branch = mongoose.model('Branch', BranchSchema);
  const TestMaster = mongoose.model('TestMaster', TestMasterSchema);
  const ReportTemplate = mongoose.model('ReportTemplate', ReportTemplateSchema);

  // Clear existing data
  await User.deleteMany({});
  await Branch.deleteMany({});
  await TestMaster.deleteMany({});
  await ReportTemplate.deleteMany({});

  // Create branch
  const branch = await Branch.create({
    name: 'Main Branch',
    address: '123 Healthcare Avenue, Medical District',
    city: 'Mumbai', state: 'Maharashtra', pincode: '400001',
    phone: '9876543210', email: 'main@healthcarelab.com',
    labName: 'HealthCare Diagnostics', labLicense: 'LAB-MH-2024-001',
  });
  console.log('✅ Branch created');

  // Create SUPER_ADMIN
  const hashedPassword = await bcrypt.hash('admin123', 12);
  await User.create({
    name: 'Super Admin', email: 'admin@healthcare.com', password: hashedPassword,
    mobile: '9999999999', role: 'SUPER_ADMIN', branchId: branch._id,
  });
  console.log('✅ Super Admin created (admin@healthcare.com / admin123)');

  // Create additional users
  await User.create([
    { name: 'Admin User', email: 'adminuser@healthcare.com', password: hashedPassword, mobile: '9999999998', role: 'ADMIN', branchId: branch._id },
    { name: 'Lab Manager', email: 'lab@healthcare.com', password: hashedPassword, mobile: '9999999997', role: 'LAB', branchId: branch._id },
    { name: 'Lab Technician', email: 'labemp@healthcare.com', password: hashedPassword, mobile: '9999999996', role: 'LAB_EMP', branchId: branch._id },
    { name: 'Front Desk', email: 'employee@healthcare.com', password: hashedPassword, mobile: '9999999995', role: 'EMPLOYEE', branchId: branch._id },
    { name: 'John Patient', email: 'patient@healthcare.com', password: hashedPassword, mobile: '9999999994', role: 'CLIENT', branchId: branch._id },
  ]);
  console.log('✅ Users created');

  // Seed 20+ Test Master entries
  const tests = [
    { name: 'Complete Blood Count (CBC)', code: 'CBC', category: 'Hematology', sampleType: 'Blood (EDTA)', price: 350, turnaroundTime: '4 hours',
      parameters: [
        { name: 'Hemoglobin', unit: 'g/dL', normalRangeMin: 12, normalRangeMax: 17.5 },
        { name: 'RBC Count', unit: 'million/cumm', normalRangeMin: 4.2, normalRangeMax: 5.8 },
        { name: 'WBC Count', unit: '/cumm', normalRangeMin: 4000, normalRangeMax: 11000 },
        { name: 'Platelet Count', unit: 'lakh/cumm', normalRangeMin: 1.5, normalRangeMax: 4.0 },
      ]},
    { name: 'Liver Function Test (LFT)', code: 'LFT', category: 'Biochemistry', sampleType: 'Blood (Serum)', price: 650, turnaroundTime: '6 hours',
      parameters: [
        { name: 'Total Bilirubin', unit: 'mg/dL', normalRangeMin: 0.1, normalRangeMax: 1.2 },
        { name: 'SGPT (ALT)', unit: 'U/L', normalRangeMin: 0, normalRangeMax: 41 },
        { name: 'Albumin', unit: 'g/dL', normalRangeMin: 3.5, normalRangeMax: 5.2 },
      ]},
    { name: 'Kidney Function Test (KFT)', code: 'KFT', category: 'Biochemistry', sampleType: 'Blood (Serum)', price: 600, turnaroundTime: '6 hours',
      parameters: [
        { name: 'Blood Urea', unit: 'mg/dL', normalRangeMin: 15, normalRangeMax: 40 },
        { name: 'Serum Creatinine', unit: 'mg/dL', normalRangeMin: 0.6, normalRangeMax: 1.2 },
        { name: 'Uric Acid', unit: 'mg/dL', normalRangeMin: 3.5, normalRangeMax: 7.2 },
      ]},
    { name: 'Lipid Profile', code: 'LIPID', category: 'Biochemistry', sampleType: 'Blood (Serum, Fasting)', price: 500, turnaroundTime: '6 hours',
      parameters: [
        { name: 'Total Cholesterol', unit: 'mg/dL', normalRangeMin: 0, normalRangeMax: 200, normalRangeText: '< 200 Desirable' },
        { name: 'Triglycerides', unit: 'mg/dL', normalRangeMin: 0, normalRangeMax: 150, normalRangeText: '< 150 Normal' },
        { name: 'HDL Cholesterol', unit: 'mg/dL', normalRangeMin: 40, normalRangeMax: 100, normalRangeText: '> 40 Desirable' },
        { name: 'LDL Cholesterol', unit: 'mg/dL', normalRangeMin: 0, normalRangeMax: 100, normalRangeText: '< 100 Optimal' },
      ]},
    { name: 'Fasting Blood Sugar', code: 'BSF', category: 'Biochemistry', sampleType: 'Blood (Fluoride)', price: 100, turnaroundTime: '2 hours',
      parameters: [ { name: 'Glucose Fasting', unit: 'mg/dL', normalRangeMin: 70, normalRangeMax: 110 } ]},
    { name: 'Thyroid Profile (T3, T4, TSH)', code: 'THYROID', category: 'Endocrinology', sampleType: 'Blood (Serum)', price: 550, turnaroundTime: '6 hours',
      parameters: [
        { name: 'T3', unit: 'ng/dL', normalRangeMin: 80, normalRangeMax: 200 },
        { name: 'T4', unit: 'µg/dL', normalRangeMin: 5.1, normalRangeMax: 14.1 },
        { name: 'TSH', unit: 'µIU/mL', normalRangeMin: 0.27, normalRangeMax: 4.2 },
      ]},
    { name: 'Urine Routine', code: 'URINE', category: 'Clinical Pathology', sampleType: 'Urine', price: 150, turnaroundTime: '2 hours',
      parameters: [
        { name: 'Color', unit: '', normalRangeText: 'Pale Yellow' },
        { name: 'Specific Gravity', unit: '', normalRangeMin: 1.005, normalRangeMax: 1.030 },
      ]},
    { name: 'Vitamin D (25-OH)', code: 'VITD', category: 'Biochemistry', sampleType: 'Blood (Serum)', price: 900, turnaroundTime: '24 hours',
      parameters: [ { name: 'Vitamin D', unit: 'ng/mL', normalRangeMin: 30, normalRangeMax: 100 } ]},
    { name: 'Vitamin B12', code: 'VITB12', category: 'Biochemistry', sampleType: 'Blood (Serum)', price: 750, turnaroundTime: '24 hours',
      parameters: [ { name: 'Vitamin B12', unit: 'pg/mL', normalRangeMin: 211, normalRangeMax: 946 } ]},
    { name: 'HbA1c', code: 'HBA1C', category: 'Biochemistry', sampleType: 'Blood (EDTA)', price: 450, turnaroundTime: '4 hours',
      parameters: [ { name: 'HbA1c', unit: '%', normalRangeMin: 4, normalRangeMax: 5.6 } ]},
    { name: 'Dengue NS1 Antigen', code: 'DNS1', category: 'Serology', sampleType: 'Blood (Serum)', price: 800, turnaroundTime: '4 hours',
      parameters: [ { name: 'NS1 Antigen', unit: '', normalRangeText: 'Non-Reactive' } ]},
    { name: 'C-Reactive Protein (CRP)', code: 'CRP', category: 'Serology', sampleType: 'Blood (Serum)', price: 500, turnaroundTime: '4 hours',
      parameters: [ { name: 'CRP', unit: 'mg/L', normalRangeMin: 0, normalRangeMax: 6 } ]},
    { name: 'Widal Test', code: 'WIDAL', category: 'Serology', sampleType: 'Blood (Serum)', price: 300, turnaroundTime: '4 hours',
      parameters: [ { name: 'S. Typhi O', unit: '', normalRangeText: '< 1:80' }, { name: 'S. Typhi H', unit: '', normalRangeText: '< 1:80' } ]},
    { name: 'Blood Grouping', code: 'BG', category: 'Hematology', sampleType: 'Blood (EDTA)', price: 150, turnaroundTime: '1 hour',
      parameters: [ { name: 'Blood Group', unit: '', normalRangeText: 'A/B/AB/O' }, { name: 'Rh Factor', unit: '', normalRangeText: 'Positive/Negative' } ]},
    { name: 'Prothrombin Time (PT/INR)', code: 'PTINR', category: 'Hematology', sampleType: 'Blood (Citrate)', price: 350, turnaroundTime: '2 hours',
      parameters: [ { name: 'PT', unit: 'seconds', normalRangeMin: 11, normalRangeMax: 13.5 }, { name: 'INR', unit: '', normalRangeMin: 0.8, normalRangeMax: 1.1 } ]},
    { name: 'Iron Studies', code: 'IRON', category: 'Biochemistry', sampleType: 'Blood (Serum)', price: 600, turnaroundTime: '6 hours',
      parameters: [ { name: 'Serum Iron', unit: 'µg/dL', normalRangeMin: 60, normalRangeMax: 170 } ]},
    { name: 'Amylase', code: 'AMY', category: 'Biochemistry', sampleType: 'Blood (Serum)', price: 400, turnaroundTime: '4 hours',
      parameters: [ { name: 'Serum Amylase', unit: 'U/L', normalRangeMin: 28, normalRangeMax: 100 } ]},
    { name: 'Lipase', code: 'LIP', category: 'Biochemistry', sampleType: 'Blood (Serum)', price: 400, turnaroundTime: '4 hours',
      parameters: [ { name: 'Serum Lipase', unit: 'U/L', normalRangeMin: 0, normalRangeMax: 60 } ]},
    { name: 'Malaria Parasite', code: 'MP', category: 'Hematology', sampleType: 'Blood (EDTA)', price: 200, turnaroundTime: '2 hours',
      parameters: [ { name: 'MP Smear', unit: '', normalRangeText: 'Not Found' } ]},
    { name: 'Urine Culture', code: 'URC', category: 'Microbiology', sampleType: 'Urine (Sterile)', price: 800, turnaroundTime: '48 hours',
      parameters: [ { name: 'Growth', unit: '', normalRangeText: 'No Growth' } ]},
    { name: 'RA Factor', code: 'RA', category: 'Serology', sampleType: 'Blood (Serum)', price: 450, turnaroundTime: '4 hours',
      parameters: [ { name: 'RA Factor', unit: 'IU/mL', normalRangeMin: 0, normalRangeMax: 20 } ]},
  ];

  await TestMaster.create(tests);
  console.log(`✅ ${tests.length} Test Master entries created`);

  // Seed Default Templates
  const templates = [
    {
      name: 'Standard Lab Report', type: 'lab_report', isDefault: true,
      content: `<html><body style="font-family:sans-serif;padding:40px;"><div style="text-align:center;border-bottom:2px solid #0ea5e9;pb:20px;"><h1 style="color:#0ea5e9;">{{branch.labName}}</h1><p>{{branch.address}}</p></div><div style="display:flex;justify-content:space-between;margin:20px 0;background:#f8fafc;padding:15px;border-radius:10px;"><div><p><strong>Patient:</strong> {{patient.name}}</p><p><strong>Age:</strong> {{patient.age}}</p></div><div><p><strong>Report #:</strong> {{reportNumber}}</p><p><strong>Date:</strong> {{reportDate}}</p></div></div><h2 style="text-align:center;color:#0ea5e9;">{{testName}}</h2><table style="width:100%;border-collapse:collapse;margin-top:20px;"><thead style="background:#0ea5e9;color:white;"><tr><th style="padding:10px;text-align:left;">Parameter</th><th style="padding:10px;text-align:left;">Result</th><th style="padding:10px;text-align:left;">Unit</th><th style="padding:10px;text-align:left;">Range</th></tr></thead><tbody>{{#each results}}<tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:10px;">{{name}}</td><td style="padding:10px;">{{value}}</td><td style="padding:10px;">{{unit}}</td><td style="padding:10px;">{{#if normalRangeText}}{{normalRangeText}}{{else}}{{normalRangeMin}}-{{normalRangeMax}}{{/if}}</td></tr>{{/each}}</tbody></table></body></html>`
    },
    {
      name: 'Modern Invoice', type: 'invoice', isDefault: true,
      content: `<html><body style="font-family:sans-serif;padding:40px;"><div style="background:white;padding:40px;border-radius:20px;box-shadow:0 10px 15px rgba(0,0,0,0.1);"><h1 style="color:#0ea5e9;">INVOICE</h1><p>Patient: {{patient.name}}</p><table style="width:100%;margin-top:20px;"><tr><th style="text-align:left;">Description</th><th style="text-align:right;">Amount</th></tr><tr><td>{{testName}}</td><td style="text-align:right;">₹{{invoice.total}}</td></tr></table><h2 style="text-align:right;color:#0ea5e9;margin-top:30px;">Total: ₹{{invoice.total}}</h2></div></body></html>`
    }
  ];

  await ReportTemplate.create(templates);
  console.log(`✅ ${templates.length} Default Templates created`);

  console.log('\n🎉 Seed completed successfully!');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => { console.error('❌ Seed failed:', err); process.exit(1); });
