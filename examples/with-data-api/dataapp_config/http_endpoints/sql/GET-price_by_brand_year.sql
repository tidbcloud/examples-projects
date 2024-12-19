use sample_data;

SELECT DISTINCT
  `name`,
  `selling_price` as `price`
FROM
  `sold_car_orders`
WHERE
  `year` = ${year}
ORDER BY
  `selling_price` DESC
LIMIT
  10;