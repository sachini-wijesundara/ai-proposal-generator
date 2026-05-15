import { jsPDF } from 'jspdf'

const addSection = (doc, title, content, y, pageWidth) => {
  const margin = 20
  const maxWidth = pageWidth - margin * 2
  let currentY = y

  if (currentY > 270) {
    doc.addPage()
    currentY = 20
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text(title, margin, currentY)
  currentY += 7

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  const lines = doc.splitTextToSize(content || '', maxWidth)
  lines.forEach((line) => {
    if (currentY > 280) {
      doc.addPage()
      currentY = 20
    }
    doc.text(line, margin, currentY)
    currentY += 5
  })

  return currentY + 5
}

export const downloadProposalPdf = (proposal) => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  let y = 20

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text(proposal.title || 'Project Proposal', 20, y)
  y += 10

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`Client: ${proposal.clientName} | Company: ${proposal.companyName} | Date: ${proposal.date}`, 20, y)
  y += 12

  y = addSection(doc, 'Introduction', proposal.introduction, y, pageWidth)
  y = addSection(doc, 'Understanding Your Requirements', proposal.requirementUnderstanding, y, pageWidth)
  y = addSection(doc, 'Proposed Solution', proposal.proposedSolution, y, pageWidth)

  const features = proposal.featuresList?.map((f, i) => `${i + 1}. ${f}`).join('\n') || ''
  y = addSection(doc, 'Key Features & Deliverables', features, y, pageWidth)
  y = addSection(doc, 'Project Timeline', proposal.timeline, y, pageWidth)
  y = addSection(doc, 'Investment & Budget', proposal.budget, y, pageWidth)
  addSection(doc, 'Conclusion', proposal.conclusion, y, pageWidth)

  const filename = `${(proposal.clientName || 'proposal').replace(/\s+/g, '-')}-proposal.pdf`
  doc.save(filename)
}
