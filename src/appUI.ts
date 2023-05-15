export async function buildAppUI(mainWidget: any, cards: any[]) {
  const divBody = document.createElement('div');
  divBody.setAttribute("class", "jp-Launcher-body")
  const divContent = document.createElement('div');
  divContent.setAttribute("class", "jp-Launcher-content")
  divBody.append(divContent)
  const sections = ["Apps"]

  const divSection = document.createElement('div');
  divSection.setAttribute("class", "jp-Launcher-section")
  const divSectionHeader = document.createElement('div');
  divSectionHeader.setAttribute("class", "jp-Launcher-sectionHeader")
  const divSectionHeaderTitle = document.createElement('h2');
  divSectionHeaderTitle.setAttribute("class", "jp-Launcher-sectionTitle")
  divSectionHeaderTitle.textContent = "Apps"
  divSectionHeader.append(divSectionHeaderTitle)

  const divSectionCardContainer = document.createElement('div');
  divSectionCardContainer.setAttribute("class", "jp-Launcher-cardContainer")

  cards.forEach(value => {
    divSectionCardContainer.append(buildCard(value.title, value.icon, value.fn))
  })

  divSection.append(divSectionHeader)
  divSection.append(divSectionCardContainer)
  divContent.append(divSection)
  mainWidget.append(divBody)
}

function buildCard(title: string, icon: string, fn: any) {
  const divCard = document.createElement('jp-LauncherCard');
  divCard.setAttribute("class", "jp-LauncherCard")
  divCard.setAttribute("title", title)
  const divCardIcon = document.createElement('jp-LauncherCard');
  divCardIcon.textContent = icon
  divCardIcon.setAttribute("class", "jp-LauncherCard-icon")
  const divCardLabel = document.createElement('jp-LauncherCard');
  divCardLabel.setAttribute("class", "jp-LauncherCard-label")
  divCardLabel.setAttribute("title", "title")
  const label = document.createElement('p');
  label.textContent = title
  divCardLabel.append(label)
  divCard.append(divCardIcon)
  divCard.append(divCardLabel)
  divCard.addEventListener("click", fn)
  return divCard;
}
