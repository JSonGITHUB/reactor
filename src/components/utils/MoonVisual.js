import moon0 from '../../assets/images/moon0.png';
import moon1 from '../../assets/images/moon1.png';
import moon2 from '../../assets/images/moon2.png';
import moon3 from '../../assets/images/moon3.png';
import moon4 from '../../assets/images/moon4.png';
import moon5 from '../../assets/images/moon5.png';
import moon6 from '../../assets/images/moon6.png';
import moon7 from '../../assets/images/moon7.png';

const MoonVisual = ({ phasePercentage, phase, icon = false, standalone = true }, ) => {
  console.log(`MoonVisual Rendered - Standalone: ${standalone}`);
  // Array of imported moon images
  const moonImages = [moon0, moon1, moon2, moon3, moon4, moon5, moon6, moon7];
  // Map phase percentage to moon image (8 phases)
  const getMoonImageIndex = () => {
    const percent = phasePercentage;
    
    // Divide lunar cycle into 8 phases
    if (percent < 6.25) return 0;      // New Moon
    if (percent < 18.75) return 1;     // Waxing Crescent
    if (percent < 31.25) return 2;     // First Quarter
    if (percent < 43.75) return 3;     // Waxing Gibbous
    if (percent < 56.25) return 4;     // Full Moon
    if (percent < 68.75) return 5;     // Waning Gibbous
    if (percent < 81.25) return 6;     // Last Quarter
    if (percent < 93.75) return 7;     // Waning Crescent
    return 0;                           // Back to New Moon
  };

  const imageIndex = getMoonImageIndex();
  const moonImagePath = moonImages[imageIndex];

  return (
    <div className={`${icon ? '' : 'containerDetail bg-dark p-20'}`}>
      <img
        src={moonImagePath}
        alt={`${phase} moon`}
        style={
          icon
            ? { width: '25px', height: '25px', borderRadius: '50%', objectFit: 'cover' }
            : standalone 
              ? { width: '300px', height: '300px', borderRadius: '50%', objectFit: 'cover' } 
              : { width: '200px', height: '200px', borderRadius: '50%', objectFit: 'cover' }
        }
        onError={(e) => {
          console.warn(`Failed to load moon image at index: ${imageIndex}`);
          e.target.style.display = 'none';
        }}
      />
    </div>
  );
}

export default MoonVisual;