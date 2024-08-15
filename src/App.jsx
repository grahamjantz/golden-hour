import { useState, useEffect } from 'react';
import { FaRegSun } from "react-icons/fa6";

function App() {
  const [location, setLocation] = useState(null);
  const [sunsetTime, setSunsetTime] = useState('');
  const [sunriseTime, setSunriseTime] = useState('');
  const [goldenHourMorning, setGoldenHourMorning] = useState('');
  const [goldenHourEvening, setGoldenHourEvening] = useState('');
  const [nextGoldenHour, setNextGoldenHour] = useState(null);
  const [countdown, setCountdown] = useState('');
  const [consent, setConsent] = useState(false); // New state for consent

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          fetchSunTimes(latitude, longitude);
          setConsent(true); // Set consent to true when location is fetched
        },
        error => console.error('Error fetching location:', error),
        { enableHighAccuracy: true }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  useEffect(() => {
    // Only request location if consent is granted
    if (consent && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          fetchSunTimes(latitude, longitude);
        },
        error => console.error('Error fetching location:', error),
        { enableHighAccuracy: true }
      );
    }
  }, [consent]);

  const fetchSunTimes = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&formatted=0`
      );
      const data = await response.json();

      const sunrise = new Date(data.results.sunrise);
      const sunset = new Date(data.results.sunset);

      setSunriseTime(sunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setSunsetTime(sunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

      const goldenHourMorningTime = new Date(sunrise);
      goldenHourMorningTime.setMinutes(goldenHourMorningTime.getMinutes() + 60);
      setGoldenHourMorning(goldenHourMorningTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

      const goldenHourEveningTime = new Date(sunset);
      goldenHourEveningTime.setMinutes(goldenHourEveningTime.getMinutes() - 60);
      setGoldenHourEvening(goldenHourEveningTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

      const now = new Date();
      let nextGoldenHourTime;
      if (now < goldenHourMorningTime) {
        nextGoldenHourTime = goldenHourMorningTime;
      } else if (now < goldenHourEveningTime) {
        nextGoldenHourTime = goldenHourEveningTime;
      } else {
        nextGoldenHourTime = new Date(goldenHourMorningTime);
        nextGoldenHourTime.setDate(nextGoldenHourTime.getDate() + 1);
      }
      setNextGoldenHour(nextGoldenHourTime);
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
      <header className='w-full flex flex-col items-center justify-center py-2 bg-[#588B8B]'>
        <div className='w-full flex items-center flex-col justify-center '>
          <img src='src\assets\sun.png' alt="Sun Icon" className='h-8'/>
          <p className='text-2xl '>Local Time: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </header>
      {!consent ? (
        <main className='w-full flex flex-col items-center justify-center mt-10 text-center p-4'>
          <p className='text-lg mb-4'>To provide you with the best experience, we need access to your location.</p>
          <button 
            onClick={requestLocation} 
            className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
          >
            Grant Location Access
          </button>
        </main>
      ) : location ? (
        <main className='w-full flex flex-col items-center'>
          <div className='w-10/12 my-4 py-4 bg-[#FFFFFFDE] text-[#242424] flex flex-col items-center rounded'>
            <h2 className="text-2xl underline ">Next Golden Hour:</h2>
            {nextGoldenHour && <p className='text-xl'>{nextGoldenHour.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>}
          </div>
          <div className='w-10/12 my-4 py-4 bg-[#FFFFFFDE] text-[#242424] flex flex-col items-center rounded'>
            <h3 className="text-lg ">Countdown: {countdown}</h3>
            <br></br>
            <hr className='w-10/12  bg-[#242424]'/>
            <br></br>
            <p>Sunset: {sunsetTime}</p>
            <p>Evening Golden Hour: {goldenHourEvening}</p>
            <br></br>
            <hr className='w-10/12  bg-[#242424]'/>
            <br></br>
            <p>Sunrise: {sunriseTime}</p>
            <p>Morning Golden Hour: {goldenHourMorning}</p>
          </div>
        </main>
      ) : (
        <p>Fetching location...</p>
      )}
    </div>
  );
}

export default App;
