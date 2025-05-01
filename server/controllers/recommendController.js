exports.recommend = async (req, res) => {
    const { source, destination, load } = req.body;
    // basic demo logic:
    let vehicle, carbonSaved;
    if (load <= 300) {
      vehicle = 'E‑Van';
      carbonSaved = (0.25 * 100) /* dummy calc */;
    } else if (load <= 1000) {
      vehicle = 'CNG Truck';
      carbonSaved = 0;
    } else {
      vehicle = 'Diesel Lorry (Optimized)';
      carbonSaved = 0;
    }
    // stub EV‑station lookup
    const evStation = vehicle.includes('E‑Van') ? 'GreenCharge Station A' : null;
  
    res.json({ vehicle, carbonSaved, evStation });
  };
  