import React, { useState } from 'react';

function ShootingContextForm({ onSubmit }) {
  const [form, setForm] = useState({
    subject: '',
    lighting: 'daylight',
    motion: 'still',
    mode: 'photo',
    style: 'natural'
  });

  const handleChange = (key, value) => {
    setForm(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
    >

      <input
        className="containerDetail inputField m-5 color-lite"
        placeholder="Subject"
        value={form.subject}
        onChange={(e) =>
          handleChange('subject', e.target.value)
        }
      />

      <select
        className="containerDetail inputField m-5 color-lite"
        value={form.lighting}
        onChange={(e) =>
          handleChange('lighting', e.target.value)
        }
      >
        <option value="daylight">Daylight</option>
        <option value="golden-hour">Golden Hour</option>
        <option value="low-light">Low Light</option>
      </select>

      <select
        className="containerDetail inputField m-5 color-lite"
        value={form.motion}
        onChange={(e) =>
          handleChange('motion', e.target.value)
        }
      >
        <option value="still">Still</option>
        <option value="fast">Fast Motion</option>
      </select>

      <select
        className="containerDetail inputField m-5 color-lite"
        value={form.mode}
        onChange={(e) =>
          handleChange('mode', e.target.value)
        }
      >
        <option value="photo">Photo</option>
        <option value="video">Video</option>
      </select>

      <button
        className="containerDetail bg-green m-5 color-yellow p-20 width--20"
        type="submit"
      >
        Generate Recommendations
      </button>

    </form>
  );
}

export default ShootingContextForm;