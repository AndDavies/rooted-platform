CREATE OR REPLACE FUNCTION get_latest_metrics(p_connection_id uuid)
RETURNS TABLE(metric_type text, value numeric, unit text, timestamp timestamptz) AS $$
  SELECT DISTINCT ON (metric_type)
    metric_type,
    value,
    unit,
    timestamp
  FROM wearable_data
  WHERE connection_id = p_connection_id
  ORDER BY metric_type, timestamp DESC;
$$ LANGUAGE sql STABLE; 