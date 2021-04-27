emoji=(:aries: :taurus: :gemini: :cancer: :leo: :virgo: :libra: :scorpius: :sagittarius: :capricorn: :aquarius: :pisces: :ophiuchus: :six_pointed_star:)
git add -A
git commit -am "${emoji[$(($RANDOM % ${#emoji[@]} + 1 ))]} xixici  push at $(date "+%Y-%m-%d %H:%M:%S")"
git pull --rebase origin master
git push -f
