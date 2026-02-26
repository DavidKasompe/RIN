# Final Polish & Fixes

1. **Integrations Page**: There is a SVG but we are not loading correctly from the public folder for Composio. It needs to read "Secured by Composio" on the Integrations pages at the bottom. (If not found just use the text "Secured by Composio").
2. **Settings Page**: Make sure the shimmer effect is centered like the actual content that loads.
3. **Sidebar Logout**: User accounts are unable to be logged out using the Sidebar. Fix this unexpected behavior by making sure users can logout.
4. **Workspace Switching**: Users are not able to switch workspaces even though after creating a new workspace. Fix workspace switching and display.
5. **Students API Integration**: Remove mock data from students list and detail list page. Restricted data to the active workspace, incorporating the actual real APIs from backend.
6. **CSV Import & Add Student**: Update the modal when they click "I have already format for CSV". Let’s have a file picker first and then a button under saying "paste csv values" instead of the current UI. Also, for the add student button on the student list page, make values match our CSV, including parent contacts, and update DB if needed.
7. **Homepage / Landing Page**: Remove testimonials (as we have no users yet). On the features page, remove any quotes and just write text, keep the starting paragraph but don't name people. Replace the image of the teacher woman with an image of a school.
8. **Overview Page**: Should have actual live living data that lives with the system, no mock data.
9. **Workflow Builder**: Update the Workflow Builder to not use emojis for integrations but use the actual logo urls from Composio or similar.

_Instructions_: Go one by one and check properly so we do not mess up what we have already, because we are practically done.
