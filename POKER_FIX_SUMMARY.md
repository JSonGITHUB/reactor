# Poker Game - Player Count Settings Fix

## Problem 1: Changing Settings During Active Game
When the number of players was changed in settings during an active poker game, the application generated errors due to:
- Array index mismatches between the `opponents` array and `numOpponents` setting
- State inconsistencies when AI logic referenced non-existent opponent indices
- Potential crashes when the game tried to process turns for players that no longer existed

## Problem 2: Settings Not Applying After Folding
After folding a hand and changing the number of opponents, dealing a new hand would revert to the old opponent count, causing:
- "Negative toCall detected" errors
- Wrong number of players appearing at the table
- Stale opponent data persisting across hands

## Solutions Implemented

### 1. **Active Game Detection**
Added a helper function `isGameActive()` that checks if a game is currently in progress:
```javascript
const isGameActive = () => {
    return gamePhase !== 'preGame' && gamePhase !== 'showdown' && gamePhase !== 'gameOver';
};
```

### 2. **Setting Lock During Active Game**
The "Opponents" dropdown is now:
- **Disabled** when a game is active (cannot be changed)
- Visually dimmed (opacity: 0.5) with a "not-allowed" cursor
- Shows a red warning label "(End hand to change)" next to the field name

### 3. **User Feedback**
Added multiple layers of feedback:

#### Info Banner
When settings panel is open during an active game:
```
ℹ️ Some settings are locked during active gameplay to prevent errors. 
Finish or fold the current hand to modify all settings.
```

#### Warning Message
If user attempts to change opponent count during active game:
```
⚠️ Cannot change number of opponents during active game! 
Please finish or fold the current hand first.
```
- Message appears for 5 seconds then auto-dismisses
- Has pulsing animation to draw attention

### 4. **CSS Enhancements**
Added styles for better visual feedback:
- `.bg-red` - Red background for warnings with pulse animation
- `.bg-yellow` - Yellow/amber background for info messages
- `.color-red` - Red text color for inline warnings
- `.size10`, `.size12` - Smaller font sizes for hints
- Disabled select styling with reduced opacity

### 5. **State Cleanup on Hand End**
Added automatic cleanup when a hand ends to prevent stale opponent data:
- Clear opponents array when returning to `preGame` state
- Clear community cards and player hands
- Reset pot, bets, and active player index

Implementation in both `showdown()` and `endHand()` functions:
```javascript
setTimeout(() => {
    setGamePhase('preGame');
    setPot(0);
    setCurrentBet(0);
    setPlayerBet(0);
    setDealerIndex((dealerIndex + 1) % (numOpponents + 1));
    setActivePlayerIndex(-1);
    setOpponents([]); // Clear opponents array
    setCommunityCards([]);
    setPlayerHand([]);
    setMessage('💡 Hand complete. Click "Deal Hand" to play again!');
}, 7000);
```

### 6. **Dynamic Opponent Count Adjustment**
Added useEffect to detect and handle changes to `numOpponents` during `preGame`:
```javascript
useEffect(() => {
    if (gamePhase === 'preGame' && opponents.length > 0 && opponents.length !== numOpponents) {
        console.log('Clearing stale opponents - count changed from', opponents.length, 'to', numOpponents);
        setOpponents([]);
        setCommunityCards([]);
        setPlayerHand([]);
        setPot(0);
        setCurrentBet(0);
        setPlayerBet(0);
    }
}, [numOpponents, gamePhase, opponents.length]);
```

This ensures that:
- When opponent count changes between hands, old opponent data is cleared
- Fresh opponents are created when dealing the next hand
- No stale bets or state from previous opponent configurations persist

## User Experience

### Before the Fix
**Scenario 1: Changing during active game**
1. User starts a poker game with 3 opponents
2. During active hand, user opens settings
3. User changes opponents to 5
4. **ERROR**: Game crashes or behaves erratically due to state mismatch

**Scenario 2: Changing after folding**
1. User plays with 3 opponents
2. User folds the hand
3. User changes opponents to 2 in settings
4. User clicks "Deal Hand"
5. **ERROR**: 3 opponents appear instead of 2, "Negative toCall" errors occur

### After the Fix
**Scenario 1: Changing during active game**
1. User starts a poker game with 3 opponents
2. During active hand, user opens settings
3. Info banner displays explaining some settings are locked
4. Opponents dropdown is disabled and shows "(End hand to change)"
5. If user tries to click it, warning message appears
6. User finishes or folds the hand
7. Opponents dropdown becomes enabled
8. User can now safely change the number of opponents

**Scenario 2: Changing after folding**
1. User plays with 3 opponents
2. User folds the hand (opponents array is cleared)
3. User changes opponents to 2 in settings (stale data is cleared via useEffect)
4. User clicks "Deal Hand"
5. ✅ **SUCCESS**: Exactly 2 new opponents are created and game starts correctly

## Technical Details

### Files Modified
1. **Poker.js**
   - Added `settingsWarning` state
   - Added `isGameActive()` helper function
   - Modified opponent select with validation and disabled state
   - Added info banner to settings panel
   - Added warning message display

2. **Poker.css**
   - Added disabled select styling
   - Added `.bg-red` warning style with animation
   - Added `.bg-yellow` info style
   - Added `.color-red` text color
   - Added size utility classes

## Benefits
- ✅ Prevents runtime errors from array index mismatches
- ✅ Fixes "Negative toCall" errors when changing opponent count
- ✅ Ensures opponent count changes apply correctly between hands
- ✅ Clear communication to users about when settings can be changed
- ✅ Maintains game state integrity throughout gameplay
- ✅ Automatic cleanup of stale data when hands end
- ✅ Improved user experience with helpful messaging
- ✅ No breaking changes to existing functionality
- ✅ Console logging for debugging opponent count changes

## Testing Recommendations
1. **Pre-game settings**: Start a game and verify settings are unlocked
2. **Mid-game lock**: Deal a hand and verify opponent setting becomes locked
3. **Mid-game warning**: Try to change opponents during active game - verify warning appears
4. **Post-fold unlock**: Fold or finish hand - verify setting becomes unlocked again
5. **Opponent count change**: 
   - Start with 3 opponents
   - Fold the hand
   - Change to 2 opponents in settings
   - Deal a new hand
   - **Verify**: Exactly 2 opponents appear (not 3)
   - **Verify**: No "Negative toCall" errors in console
6. **Multiple changes**: Change opponent count multiple times between hands - verify each change takes effect
7. **Load saved game**: Load a saved game - verify setting lock state is correct based on game phase
