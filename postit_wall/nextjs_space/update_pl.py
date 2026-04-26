import pexpect
import sys

with open('app/page.tsx', 'r') as f:
    text = f.read()

# Let's try to match the slider to the title by overriding the slider's container
# Actually wait... the user said HEAD TO POSTIT! 
# Let me change the container's margin!
