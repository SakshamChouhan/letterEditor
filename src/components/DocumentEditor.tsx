import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // import styles for ReactQuill editor

const DocumentEditor = ({ title, content, onSave }: any) => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2>{title}</h2>
      <ReactQuill value={content} onChange={onSave} theme="snow" />
      <button onClick={() => onSave(title, content)}>Save Document</button>
    </div>
  );
};

export default DocumentEditor;
