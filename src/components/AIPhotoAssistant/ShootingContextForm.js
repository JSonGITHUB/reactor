import React, { useState } from 'react';

function ShootingContextForm({ onSubmit }) {
  const [form, setForm] = useState({
    subject: '',
    lighting: 'bright',
    motion: 'still',
    effect: 'portrait',
    scene: '',
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
        <option value="bright">Bright Sunlight</option>
        <option value="low">Low Light</option>
        <option value="medium">Indoor / Mixed Light</option>
        <option value="backlit">Backlit Subject</option>
        <option value="studio">Studio Light</option>
      </select>



      <select
        className="containerDetail inputField m-5 color-lite"
        value={form.motion}
        onChange={(e) =>
          handleChange('motion', e.target.value)
        }
      >
        <option value="still">Still</option>
        <option value="slow">Slow</option>
        <option value="fast">Fast</option>
      </select>

      <select
        className="containerDetail inputField m-5 color-lite"
        value={form.effect}
        onChange={(e) =>
          handleChange('effect', e.target.value)
        }
      >
        <option value="portrait">Portrait</option>
        <option value="landscape">Landscape</option>
        <option value="macro">Macro</option>
        <option value="action">Action</option>
        <option value="nightSky">Night Sky</option>
        <option value="smoothWater">Smooth Water</option>
        <option value="bokeh">Bokeh</option>
      </select>


      <select
        className="containerDetail inputField m-5 color-lite"
        value={form.scene}
        onChange={(e) =>
          handleChange('scene', e.target.value)
        }
      >
        <option value="">None</option>
        <option value="outdoor">Outdoor</option>
        <option value="indoor">Indoor</option>
        <option value="studio">Studio</option>
        <option value="city">City / Urban</option>
        <option value="nature">Nature / Forest</option>
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