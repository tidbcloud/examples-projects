use sample_data;

SELECT
  name,
  COUNT(*) AS order_count
FROM
  `sold_car_orders`
WHERE
  `year` = ${year}
GROUP BY
  `name`
ORDER BY
  order_count DESC
LIMIT 10;