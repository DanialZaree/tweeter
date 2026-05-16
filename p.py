import base64

# اعداد رو به bytes تبدیل + XOR کل با 37
nums = [37, 152, 187, 149]
num_bytes = bytes(nums)  # b'%\x98\xbb\x95'
ssp = ''.join(chr(b ^ 0x25) for b in num_bytes)  # 37=0x25
print("ssp درست:", repr(ssp))  # '%ssp'

# یا مستقیم: اولین عدد کلید → ssp
print("ssp ساده:", 'ssp')

# آخرین تکه‌های مختلف تست کن
last_pieces = [
    "l9p3ka9kwbtnkovc",  # اصلی
    "97da7791af64c1bb67928bdc",  # hex
]

for piece in last_pieces:
    try:
        decoded = base64.b64decode(piece)
        print(f"{piece}: {decoded.hex()} | XOR37: {bytes(b^0x25 for b in decoded).hex()}")
    except:
        print(f"{piece}: Base64 نامعتبر")

# مسیرهای محتمل:
paths = [
    "ssp2096/sub/l9p3ka9kwbtnkovc",
    "%ssp2096/sub/97da7791af64c1bb67928bdc",
    "ssp2096/sub/97da7791af64c1bb67928bdc"
]
print("\nمسیرهای تست:")
for p in paths: print(p)