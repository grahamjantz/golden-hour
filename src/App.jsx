import { useState, useEffect } from 'react';
import { FaRegSun } from "react-icons/fa6";

function App() {
  const [location, setLocation] = useState(null);
  const [sunsetTime, setSunsetTime] = useState('');
  const [sunriseTime, setSunriseTime] = useState('');
  const [goldenHourMorning, setGoldenHourMorning] = useState('');
  const [goldenHourEvening, setGoldenHourEvening] = useState('');
  const [nextGoldenHour, setNextGoldenHour] = useState(null); // Initialize as null
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    // Request location access and get the user's coordinates
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          fetchSunTimes(latitude, longitude);
        },
        error => console.error('Error fetching location:', error),
        { enableHighAccuracy: true }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  }, []);

  const fetchSunTimes = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&formatted=0`
      );
      const data = await response.json();

      const sunrise = new Date(data.results.sunrise);
      const sunset = new Date(data.results.sunset);

      setSunriseTime(sunrise.toLocaleTimeString());
      setSunsetTime(sunset.toLocaleTimeString());

      // Calculate morning golden hour as one hour after sunrise
      const goldenHourMorningTime = new Date(sunrise);
      goldenHourMorningTime.setMinutes(goldenHourMorningTime.getMinutes() + 60);
      setGoldenHourMorning(goldenHourMorningTime.toLocaleTimeString());

      // Calculate evening golden hour as one hour before sunset
      const goldenHourEveningTime = new Date(sunset);
      goldenHourEveningTime.setMinutes(goldenHourEveningTime.getMinutes() - 60);
      setGoldenHourEvening(goldenHourEveningTime.toLocaleTimeString());

      // Determine the next golden hour
      const now = new Date();
      let nextGoldenHourTime;
      if (now < goldenHourMorningTime) {
        nextGoldenHourTime = goldenHourMorningTime;
      } else if (now < goldenHourEveningTime) {
        nextGoldenHourTime = goldenHourEveningTime;
      } else {
        // If both golden hours have passed, set the next day's morning golden hour
        nextGoldenHourTime = new Date(goldenHourMorningTime);
        nextGoldenHourTime.setDate(nextGoldenHourTime.getDate() + 1);
      }
      setNextGoldenHour(nextGoldenHourTime);

      // Start the countdown
      startCountdown(nextGoldenHourTime);
    } catch (error) {
      console.error('Error fetching sun times:', error);
    }
  };

  const startCountdown = (nextGoldenHourTime) => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeDiff = nextGoldenHourTime - now;

      if (timeDiff <= 0) {
        clearInterval(interval);
        setCountdown('Golden hour is now!');
        return;
      }

      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

      setCountdown(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);
  };

  return (
    <div className='App w-screen min-h-screen flex flex-col items-center justify-start'>
      <header className='w-full flex flex-col items-center justify-center py-4 bg-[#588B8B]'>
        <div className='w-full flex items-center justify-center gap-4'>
          <FaRegSun size={30} color='#FFD3B4'/>
          {/* <h1 className="text-2xl text-[#FFD3B4]">Golden Hour</h1> */}
          <p className='text-2xl '>Local Time: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </header>
      {location ? (
        <main className='w-full flex flex-col items-center'>
          <div className='w-10/12 my-4 bg-[#FFFFFFDE] text-[#242424] flex flex-col items-center rounded'>
            <h2 className="text-2xl mt-4 underline ">Next Golden Hour:</h2>
            {nextGoldenHour && <p className='text-xl'>{nextGoldenHour.toLocaleTimeString()}</p>}
            <br></br>
          </div>
          <h3 className="text-lg mt-2">Countdown: {countdown}</h3>
          <br></br>
          <p>Sunset Time: {sunsetTime}</p>
          <p>Evening Golden Hour: {goldenHourEvening}</p>
          <br></br>
          <p>Sunrise Time: {sunriseTime}</p>
          <p>Morning Golden Hour: {goldenHourMorning}</p>
        </main>
      ) : (
        <p>Fetching location...</p>
      )}
    </div>
  );
}

export default App;
