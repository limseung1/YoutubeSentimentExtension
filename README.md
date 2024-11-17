
# Bugs:

# 1.
- Opening another tab does not make inference
- Cause: offscreen is already created, (only allowed to create one) preventing next tab from completing initalization
- Solution:

# 2.
- Need to sanitize input texts before running inference with it
- Cause: texts may include symbols that are not Bigint
- Solution:
