import * as fa from '@fortawesome/free-solid-svg-icons/index'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Grid, IconButton, Link, List, Table, TableCell, TableHead, TableRow } from '@material-ui/core'
import Chip from '@material-ui/core/Chip'
import ListItemText from '@material-ui/core/ListItemText'
import withStyles from '@material-ui/core/styles/withStyles'
import TableBody from '@material-ui/core/TableBody'
import Typography from '@material-ui/core/Typography'
import classNames from 'classnames'
import React from 'react'
import { dashboardWindowStyles, headerStyle, listEntryStyle, sidebarStyle } from '../styles/dashboard'
import DividedPage from './divided_page'

export interface ProjectOptions {
  /** project name */
  name: string
  /** item type */
  itemType: string
  /** label type */
  labelTypes: string[]
  /** task size */
  taskSize: number
  /** number of items */
  numItems: number
  /** number of categories */
  numLeafCategories: number
  /** number of attributes */
  numAttributes: number
}

export interface TaskOptions {
  /** number of labeled images */
  numLabeledItems: string
  /** number of labels */
  numLabels: string
  /** if the task was submitted */
  submitted: boolean
  /** task link handler url */
  handlerUrl: string
}

export interface DashboardContents {
  /** project metadata */
  projectMetaData: ProjectOptions
  /** tasks */
  taskMetaDatas: TaskOptions[]
}

interface DashboardClassType {
  /** root */
  root: string
  /** table row */
  row: string
  /** task link button */
  linkButton: string
  /** table header cell */
  headerCell: string
  /** table body cell */
  bodyCell: string
}

interface DashboardProps {
  /** Create classes */
  classes: DashboardClassType
  /** dashboard contents */
  dashboardContents: DashboardContents
  /** if this is the vendor dashboard */
  vendor?: boolean
}

interface HeaderProps {
  /** header classes */
  classes: HeaderClassType
  /** total tasks */
  totalTaskLabeled: number
  /** total labels */
  totalLabels: number
  /** if this is the vendor dashboard */
  vendor?: boolean
}

interface HeaderClassType {
  /** flex grow buffer style */
  grow: string
  /** class type for chip */
  chip: string
}

interface SidebarProps {
  /** sidebar classes */
  classes: SidebarClassType
  /** project metadata */
  projectMetaData: ProjectOptions
  /** if this is the vendor dashboard */
  vendor?: boolean
}

interface SidebarClassType {
  /** list root */
  listRoot: string
  /** list item */
  listItem: string
  /** colored list item */
  coloredListItem: string
  /** link class */
  link: string
}

interface ListEntryProps {
  /** sidebar classes */
  classes: ListEntryClassType
  /** entry tag */
  tag: string
  /** entry value */
  entry: string | number
}

interface ListEntryClassType {
  /** list tag */
  listTag: string
  /** list entry */
  listEntry: string
  /** list grid container */
  listContainer: string
}

/**
 * creates the dashboard component
 * @param props
 * @constructor
 */
function Dashboard (props: DashboardProps) {
  const { classes, vendor } = props
  let totalTaskLabeled = 0
  let totalLabels = 0
  const projectMetaData = props.dashboardContents.projectMetaData
  const taskMetaDatas = props.dashboardContents.taskMetaDatas
  const sidebarContent = (
    <StyledSidebar projectMetaData={projectMetaData} vendor={vendor} />
  )
  const align = 'center'
  const mainContent = (
    <div className={classes.root}>
      <Table size='small'>
        <TableHead>
          <TableRow>
            <TableCell align={align} className={classes.headerCell}>
              {'Task Index'}</TableCell>
            <TableCell align={align} className={classes.headerCell}>
              {'# Labeled Images'}</TableCell>
            <TableCell align={align} className={classes.headerCell}>
              {'# Labels'}</TableCell>
            <TableCell align={align} className={classes.headerCell}>
              {'Submitted'}</TableCell>
            <TableCell align={align} className={classes.headerCell}>
              {'Task Link'}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {taskMetaDatas.map((value: TaskOptions, index) => {
            totalLabels += Number(value.numLabels)
            totalTaskLabeled += Number(value.numLabeledItems) > 0 ? 1 : 0
            return (
              <TableRow
                key={index}
                className={index % 2 === 0 ? classes.row : ''}
              >
                <TableCell className={classes.bodyCell} align={align}>
                  {index}
                </TableCell>
                <TableCell
                  className={classes.bodyCell}
                  align={align}
                  data-testid={'num-labeled-images-' + index.toString()}
                >
                  {value.numLabeledItems}
                </TableCell>
                <TableCell
                  className={classes.bodyCell}
                  align={align}
                  data-testid={'num-labels-' + index.toString()}
                >
                  {value.numLabels}
                </TableCell>
                <TableCell className={classes.bodyCell} align={align}>
                  {value.submitted ? (
                    <FontAwesomeIcon
                      icon={fa.faCheck}
                      size={'lg'}
                      data-testid={'submitted-' + index.toString()}
                    />
                  ) : null}
                </TableCell>
                <TableCell className={classes.bodyCell} align={align}>
                  <IconButton
                    className={classes.linkButton}
                    color='inherit'
                    href={
                      './' +
                      value.handlerUrl +
                      '?project_name=' +
                      projectMetaData.name +
                      '&task_index=' +
                      index
                    }
                    data-testid={'task-link-' + index.toString()}
                  >
                    <FontAwesomeIcon icon={fa.faExternalLinkAlt} size={'sm'} />
                  </IconButton>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
  const headerContent = (
    <StyledHeader totalLabels={totalLabels}
      totalTaskLabeled={totalTaskLabeled}
      vendor={vendor} />
  )
  /**
   * renders the dashboard
   * @return component
   */
  return (
    <DividedPage children={{
      headerContent,
      sidebarContent,
      mainContent
    }} />
  )
}

/** creates the header */
function header (props: HeaderProps) {
  const { classes, totalLabels, totalTaskLabeled, vendor } = props
  return (
    <React.Fragment>
      <Typography variant='h6' noWrap>
        {vendor ? 'Vendor Dashboard' : 'Project Dashboard'}
      </Typography>
      <div className={classes.grow} />
      {vendor ? null :
        <React.Fragment>
          <Typography variant='body1' noWrap>
            Labeled Tasks
                      </Typography>
          <Chip label={totalTaskLabeled} className={classes.chip}
            data-testid='total-tasks' />
          <Typography variant='body1' noWrap>
            Total Labels
                      </Typography>
          <Chip label={totalLabels} className={classes.chip}
            data-testid='total-labels' />
        </React.Fragment>}
    </React.Fragment>
  )
}

/** creates the sidebar */
function sidebar (props: SidebarProps) {
  const { classes, projectMetaData, vendor } = props
  const sidebarListItems = [
    { tag: 'Project Name', entry: projectMetaData.name },
    { tag: 'Item Type', entry: projectMetaData.itemType },
    { tag: 'Label Type', entry: projectMetaData.labelTypes[0] },
    { tag: 'Task Size', entry: projectMetaData.taskSize },
    { tag: '# Items', entry: projectMetaData.numItems },
    { tag: '# Categories', entry: projectMetaData.numLeafCategories },
    { tag: '# Attributes', entry: projectMetaData.numAttributes }
  ]
  return (<React.Fragment>
    <List className={classes.listRoot}>
      {sidebarListItems.map((value, index) =>
        <ListItemText
          key={value.tag}
          className={!(index % 2) ?
            classNames(classes.listItem,
              classes.coloredListItem) :
            classes.listItem}
          primary={
            <StyledListEntry tag={value.tag} entry={value.entry} />
          }
        />
      )
      }
    </List>
    {vendor ? null :
      <React.Fragment>
        <Link
          variant='button'
          className={classes.link}
          color='inherit'
          href={
            './postExportV2?project_name=' +
            projectMetaData.name
          }
          data-testid='export-link'
        >
          EXPORT RESULTS
              </Link>
        < Link
          variant='body2'
          className={classes.link}
          color='inherit'
          href={'./postDownloadTaskURL?project_name=' +
            projectMetaData.name}
          data-testid='download-link'

        >
          DOWNLOAD ASSIGNMENT URLS
              </Link>
      </React.Fragment>}

  </React.Fragment>)
}

/** sidebar list entry */
function listEntry (props: ListEntryProps) {
  const { classes, tag, entry } = props
  return (
    <React.Fragment>
      <Grid spacing={1}
        alignItems={'baseline'}
        justify={'space-around'}
        className={classes.listContainer}
        container>
        <Grid item xs>
          <Typography
            className={classes.listTag}
            variant='body2'>
            {tag}
          </Typography>
        </Grid>
        <Grid item xs>
          <Typography
            className={classes.listEntry}
            variant='body2'
          >
            {entry}
          </Typography>
        </Grid>
      </Grid>
    </React.Fragment>
  )
}

/** export sub-components for testing */
export const StyledHeader = withStyles(headerStyle)(header)
export const StyledSidebar = withStyles(sidebarStyle)(sidebar)
const StyledListEntry = withStyles(listEntryStyle)(listEntry)
/** export dashboard page */
export default withStyles(dashboardWindowStyles, { withTheme: true })(Dashboard)
