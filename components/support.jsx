import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function Support() {
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Support</CardTitle>
        <CardDescription>Learn how to use the system and find answers to common questions.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">How to Use the System</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>Navigate through different sections using the sidebar menu.</li>
            <li>Use the "Add Individual" button to add new people to the audience.</li>
            <li>Edit or delete existing records using the action buttons in the audience list.</li>
            <li>Use filters and search to find specific individuals in the audience.</li>
            <li>View analytics and reports in the Dashboard section.</li>
          </ol>
        </div>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>How do I add a new person to the audience?</AccordionTrigger>
            <AccordionContent>
              Click the "Add Individual" button on the Audience page. Fill out the form with the person's details and submit. The new individual will be added to the audience list.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Can I edit someone's information after adding them?</AccordionTrigger>
            <AccordionContent>
              Yes, you can edit a person's information. In the audience list, click the "Edit" button next to the person's name. This will open a form where you can update their details.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>How do I filter the audience list?</AccordionTrigger>
            <AccordionContent>
              Use the dropdown menus above the audience list to filter by clan, citizenship, or hometown. You can also use the search bar to find specific individuals by name.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger>What should I do if I accidentally delete someone?</AccordionTrigger>
            <AccordionContent>
              Currently, there's no way to undo a deletion. If you accidentally delete someone, you'll need to re-add them using the "Add Individual" form. Always double-check before confirming a deletion.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-5">
            <AccordionTrigger>How can I generate reports?</AccordionTrigger>
            <AccordionContent>
              Navigate to the Dashboard section using the sidebar menu. Here you'll find various charts and statistics about the audience. For more detailed reports, look for a "Generate Report" button (if available) or contact the system administrator.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}
