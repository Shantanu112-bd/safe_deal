import csv
import re

with open('user_onboarding_responses.csv', 'r') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

feedback_md = "\n"
for i, row in enumerate(rows, 1):
    wallet = row['Wallet Address']
    email = row['Email']
    name = row['Name']
    rating = row['Product Rating (1-5)']
    feedback = row['Feedback/Comments']
    
    feedback_md += f"{i}. **{name}** (`{email}`)\n"
    feedback_md += f"   - **Wallet**: `{wallet}`\n"
    feedback_md += f"   - **Rating**: {rating}/5\n"
    feedback_md += f"   - **Feedback**: \"{feedback}\"\n\n"

with open('USER_FEEDBACK.md', 'r') as f:
    content = f.read()

prefix, rest = content.split('## Tester Feedback\n')
# split rest by Overall Metrics
mid, suffix = rest.split('## Overall Metrics (Beta Phase)')

# update beta tester count explicitly
suffix = re.sub(r'Total Verified Beta Testers: \d+', f'Total Verified Beta Testers: {len(rows)}', suffix)

new_content = prefix + "## Tester Feedback\n" + feedback_md + "## Overall Metrics (Beta Phase)" + suffix

with open('USER_FEEDBACK.md', 'w') as f:
    f.write(new_content)
