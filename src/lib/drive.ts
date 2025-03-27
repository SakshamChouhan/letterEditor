import axios from 'axios';
const API_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';


export const saveDocumentToDrive = async (
   accessToken: string, 
   title: string, 
   content: string, 
   folderId: string, 
   userEmail: string 
 ) => {
   try {
 
     const fileMetadata = {
       name: title,
       mimeType: 'application/vnd.google-apps.document',
       parents: [folderId], 
     };
 
     const formData = new FormData();
     
     formData.append(
       'metadata', 
       new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' })
     );
 
 
     formData.append('file', new Blob([content], { type: 'text/html' }));
 
    
     const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
       method: 'POST',
       headers: {
         Authorization: `Bearer ${accessToken}`,
       },
       body: formData,
     });
 
     const data = await res.json();
     if (res.ok) {
       const fileId = data.id; 
       
     
     const saveResponse = await fetch(`${API_URL}/api/saveFileMetadata`, {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
           },
           body: JSON.stringify({
             fileId,
             fileName: title,
             userEmail,
           }),
         });
         
       const responseText = await saveResponse.text(); 
       const saveData = JSON.parse(responseText);  
         
       if (saveResponse.ok) {
         return fileId; 
       } else {
         throw new Error(saveData.error || 'Failed to save file metadata');
       }
     } else {
       throw new Error(data.error.message);
     }
   } catch (error) {
     console.error('Error saving document:', error);
     throw error;
   }
 };
  

 export const getGoogleDriveFolders = async (accessToken: string) => {
   try {
       console.log(accessToken);
     const res = await fetch('https://www.googleapis.com/drive/v3/files?q=mimeType%20%3D%20%27application%2Fvnd.google-apps.folder%27', {
       headers: {
         Authorization: `Bearer ${accessToken}`,
       },
     });
     const data = await res.json();
     if (res.ok) {
       return data.files || [];
     } else {
       throw new Error(data.error.message);
     }
   } catch (error) {
     console.error('Error fetching Google Drive folders:', error);
     return [];
   }
 };


 export const updateDocumentInDrive = async (
   fileId: string,
   fileName: string,
   content: string,
   accessToken: string,
   userEmail: string
 ) => {
   try {
     const fileMetadata = {
       name: fileName,
     };
 
     await axios.patch(`https://www.googleapis.com/drive/v3/files/${fileId}`, fileMetadata, {
       headers: {
         Authorization: `Bearer ${accessToken}`,
         'Content-Type': 'application/json',
       },
     });

     const res = await fetch(`${API_URL}/api/updateFileMetadata`, { 
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         fileId,
         newFileName: fileName,
         userEmail, 
       }),
     });

     const formData = new FormData();
   formData.append(
     'metadata',
     new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' })
   );
   formData.append('file', new Blob([content], { type: 'text/html' }));

   await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`, {
     method: 'PATCH',
     headers: {
       Authorization: `Bearer ${accessToken}`,
     },
     body: formData,
   });
     
 
     const data = await res.json();
     if (res.ok) {
       console.log('File metadata updated successfully in MongoDB');
     } else {
       console.error('Error updating file metadata in MongoDB:', data.error);
     }
 
   } catch (error) {
     console.error('Error updating document in Drive:', error);
     throw new Error('Failed to update document in Drive');
   }
 };
 

import mammoth from 'mammoth';

export async function getGoogleDriveFile(fileId: string, accessToken: string) {
 
 try {
   const metadataResponse = await axios.get(
     `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name`,
     {
       headers: { Authorization: `Bearer ${accessToken}` },
     }
   );

   const fileTitle = metadataResponse.data.name;  
   const contentResponse = await axios.get(
     `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=application/vnd.openxmlformats-officedocument.wordprocessingml.document`,
     {
       headers: { Authorization: `Bearer ${accessToken}` },
       responseType: 'arraybuffer',  
     }
   );

   const result = await mammoth.convertToHtml({ buffer: contentResponse.data });
   const fileContent = result.value;
   
   const fileData = {
     title: fileTitle,
     content: fileContent, 
   };

   return fileData; 
 } catch (error) {
   console.error("Error fetching file from Google Drive:", error);
   throw new Error('Error fetching file from Google Drive');
 }
}
