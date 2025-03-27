import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  fileId: { type: String, required: true },
  fileName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.File || mongoose.model('File', FileSchema);
