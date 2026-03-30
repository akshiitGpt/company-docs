# Heartbeat Checklist

## Every hour
- Run Linear sync to update sprint data
- Check if any sync errors occurred in the last run

## Every 6 hours
- Run full sync (Linear + GitHub repos + git logs)
- Rebuild the index
- Report any stale docs (last_updated > 30 days) via Slack

## Daily (9am)
- Generate a morning brief: current sprint status + any blocked issues
- Post to #engineering Slack channel
