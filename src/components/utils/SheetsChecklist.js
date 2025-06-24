import React, { useState, useEffect } from 'react';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import config from '../apis/config';

const Checklist = () => {
  const [checklistItems, setChecklistItems] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Function to fetch checklist data from Google Sheets
    const fetchChecklistData = async () => {
      const doc = new GoogleSpreadsheet('1jMoKqPpdiejbe757ZOL-ObVpEnb_IWlWTzPqJmM0T1Y');
      //https://docs.google.com/spreadsheets/d/1jMoKqPpdiejbe757ZOL-ObVpEnb_IWlWTzPqJmM0T1Y/edit?usp=sharing
      // Authenticate with your Google Sheets credentials
      await doc.useApiKey(config.googleAPI_KEY);

      await doc.loadInfo(); // Loads document properties and worksheets
      const sheet = doc.sheetsByIndex[0]; // Assuming the checklist data is in the first sheet
      const rows = await sheet.getRows(); // Get all rows from the sheet

      const items = rows.map(row => ({
        id: row.id,
        text: row.text,
        completed: row.completed === 'true'
      }));
      setChecklistItems(items);
      setLoading(false);
    };

    fetchChecklistData();
  }, []);

  const handleCheckboxChange = async (itemId, completed) => {
    // Update the local state
    const updatedItems = checklistItems.map(item =>
      item.id === itemId ? { ...item, completed } : item
    );
    setChecklistItems(updatedItems);

    // Update the Google Sheets data
    const doc = new GoogleSpreadsheet('YOUR_GOOGLE_SHEET_ID');
    await doc.useApiKey('YOUR_GOOGLE_API_KEY');
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rowToUpdate = sheet.rows.find(row => row.id === itemId);
    rowToUpdate.completed = completed.toString(); // Convert boolean to string
    await rowToUpdate.save();
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h2>Checklist</h2>
      <ul>
        {checklistItems.map(item => (
          <li key={item.id}>
            <input
              id={item.id}
              name={item.id}
              type='checkbox'
              checked={item.completed}
              onChange={e => handleCheckboxChange(item.id, e.target.checked)}
            />
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Checklist;