import { formatDistanceStrict } from 'date-fns';
import { useEffect, useState } from 'react';
import { secondsToFrom } from '../utils/yieldMath';

const useTimeTillMaturity = (maturity: number) => {
  const [secondsTillMaturity, setSecondsTillMaturity] = useState<number>(0);

  useEffect(() => {
    const _secondsTillMaturity = Number(secondsToFrom(maturity.toString()));
    _secondsTillMaturity > 0 ? setSecondsTillMaturity(_secondsTillMaturity) : setSecondsTillMaturity(0);
  }, [maturity]);

  useEffect(() => {
    let timer;

    if (secondsTillMaturity > 0) {
      timer = setTimeout(() => {
        setSecondsTillMaturity((time) => time - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [secondsTillMaturity]);

  const timeTillMaturity_ = formatDistanceStrict(
    new Date(1, 1, 0, 0, 0, 0),
    new Date(1, 1, 0, 0, 0, secondsTillMaturity)
  );

  return timeTillMaturity_;
};

export default useTimeTillMaturity;
