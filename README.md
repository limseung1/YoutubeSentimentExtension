
# Bugs:

# 1.
- Opening another tab does not make inference
- Cause: offscreen is already created, (only allowed to create one) preventing next tab from completing initalization
- Solution: check for existing offscreen and if so, send response and terminate initialize function

# 2.
- Need to sanitize input texts before running inference with it
- Cause: texts may include symbols that are not Bigint
- Solution:
