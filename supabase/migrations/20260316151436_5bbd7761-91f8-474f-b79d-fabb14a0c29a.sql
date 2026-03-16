
-- Fix search_path for all functions
ALTER FUNCTION validate_student_status() SET search_path = public;
ALTER FUNCTION validate_fee_record() SET search_path = public;
ALTER FUNCTION update_updated_at() SET search_path = public;
