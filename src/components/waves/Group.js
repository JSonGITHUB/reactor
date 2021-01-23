const group = (item) => {
    if (item.description === "Location") {
        //console.log(`GROUP => local spots: ${this.getLocalSpots()}`)
      //  return this.getLocalSpots();
    }
    //console.log(`Group => item.group: ${JSON.stringify(item,null,2)}`)
    return item.group;
    
};
export default group;