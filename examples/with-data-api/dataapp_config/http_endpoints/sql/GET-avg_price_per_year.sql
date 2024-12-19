use sample_data;

SELECT
  `year`,
  AVG(`selling_price`) AS price
FROM
  `sample_data`.`sold_car_orders`
GROUP BY
  `year`
ORDER BY
  `year`;
