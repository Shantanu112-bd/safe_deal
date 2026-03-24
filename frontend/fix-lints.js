const fs = require('fs');

function fixDocs() {
  let content = fs.readFileSync('src/app/docs/page.tsx', 'utf-8');
  content = content.replace(/Lock,\s*/, '');
  content = content.replace(/"it's"/g, '"it&apos;s"');
  content = content.replace(/'re/g, '&apos;re');
  content = content.replace(/'s/g, '&apos;s');
  content = content.replace(/'t/g, '&apos;t');
  content = content.replace(/"Testnet"/g, '&quot;Testnet&quot;');
  content = content.replace(/"Mainnet"/g, '&quot;Mainnet&quot;');
  content = content.replace(/"Stellar"/g, '&quot;Stellar&quot;');
  content = content.replace(/"test"/g, '&quot;test&quot;');
  content = content.replace(/"locked"/g, '&quot;locked&quot;');
  content = content.replace(/"completed"/g, '&quot;completed&quot;');
  content = content.replace(/"disputed"/g, '&quot;disputed&quot;');
  content = content.replace(/"Secret Key"/g, '&quot;Secret Key&quot;');
  content = content.replace(/{ \/\* (.*?) \*\/ }/g, '{/* $1 */}');
  fs.writeFileSync('src/app/docs/page.tsx', content);
}

function fixProfile() {
  let content = fs.readFileSync('src/app/dashboard/profile/page.tsx', 'utf-8');
  content = content.replace(/ShieldAlert,\s*/, '');
  content = content.replace(/TrendingUp,\s*/, '');
  content = content.replace(/Activity\s*/, '');
  content = content.replace(/,\s*useEffect/, '');
  content = content.replace(/isConnected,\s*/, '');
  content = content.replace(/,\s*fraudScore,\s*fraudLevel/, '');
  content = content.replace(/const \[copied,\s*setCopied\]\s*=\s*useState\(false\);/, '');
  content = content.replace(/setCopied\(true\);/, '');
  content = content.replace(/setTimeout\(\(\) => setCopied\(false\), 2000\);/, '');
  fs.writeFileSync('src/app/dashboard/profile/page.tsx', content);
}

function fixDeal() {
  let content = fs.readFileSync('src/app/deal/[id]/page.tsx', 'utf-8');
  content = content.replace(/Timer,\s*/, '');
  content = content.replace(/Smartphone,\s*/, '');
  content = content.replace(/ExternalLink,\s*/, '');
  content = content.replace(/ChevronRight\s*/, '');
  content = content.replace(/const \[payoutTxHash,\s*setPayoutTxHash\]\s*=\s*useState<string\s*\|\s*null>\(null\);/, '');
  content = content.replace(/setPayoutTxHash\([^)]+\);/, '');
  content = content.replace(/const formatTime\s*=\s*\([^)]+\)\s*=>\s*{[^}]+};\s*/, '');
  content = content.replace(/'s/g, '&apos;s');
  content = content.replace(/'t/g, '&apos;t');
  fs.writeFileSync('src/app/deal/[id]/page.tsx', content);
}

function fixNavbar() {
  let content = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf-8');
  content = content.replace(/import { GradientButton } from "@\/components\/ui\/gradient-button";\n/, '');
  fs.writeFileSync('src/components/layout/Navbar.tsx', content);
}

function fixFeeBump() {
  let content = fs.readFileSync('src/lib/feeBump.ts', 'utf-8');
  content = content.replace(/const _signedInnerXDR.*?;/, '');
  fs.writeFileSync('src/lib/feeBump.ts', content);
}

function fixDashboard() {
  let content = fs.readFileSync('src/app/dashboard/page.tsx', 'utf-8');
  content = content.replace(/import { GradientButton } from "@\/components\/ui\/gradient-button";\n/, '');
  content = content.replace(/Zap,\s*/, '');
  content = content.replace(/import { cn } from "@\/lib\/utils";\n/, '');
  content = content.replace(/CartesianGrid\s*/, '');
  content = content.replace(/,\s*fraudScore,\s*fraudLevel/, '');
  fs.writeFileSync('src/app/dashboard/page.tsx', content);
}

try {
  fixDocs();
  fixProfile();
  fixDeal();
  fixNavbar();
  fixFeeBump();
  fixDashboard();
  console.log('Fixed all syntax and lint errors based on exact unused imports');
} catch (err) {
  console.error(err);
}
