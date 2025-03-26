import pandas as pd
# 创建一个包含键'time'和值'NaT'的DataFrame
df = pd.DataFrame({'time': [pd.NaT]})

# 打印DataFrame
print(df.to_dict())
