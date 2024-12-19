use sample_data;

SELECT
  `year`,
  COUNT(*) AS order_count
FROM
  `sold_car_orders`
GROUP BY
  `year`
ORDER BY
  `year`;