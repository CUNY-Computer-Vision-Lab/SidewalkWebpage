package models.label

import models.utils.MyPostgresDriver.api._
import play.api.Play.current

case class LabelSeverity(labelSeverityId: Int, labelId: Int, severity: Int)

class LabelSeverityTable(tag: slick.lifted.Tag) extends Table[LabelSeverity](tag, Some("sidewalk"), "label_severity") {
  def labelSeverityId = column[Int]("label_severity_id", O.PrimaryKey, O.AutoInc)
  def labelId = column[Int]("label_id")
  def severity = column[Int]("severity")

  def * = (labelSeverityId, labelId, severity) <> ((LabelSeverity.apply _).tupled, LabelSeverity.unapply)
}

object LabelSeverityTable {
  val db = play.api.db.slick.DB
  val labelSeverities = TableQuery[LabelSeverityTable]

  /**
    * Find a label severity
    *
    * @param labelId
    * @return
    */
  def find(labelId: Int): Option[LabelSeverity] = db.withSession { implicit session =>
    val labelList = labelSeverities.filter(_.labelId === labelId).list
    labelList.headOption
  }

  /**
    * Saves a new label severity to the table.
    *
    * @param labelSev
    * @return
    */
  def save(labelSev: LabelSeverity): Int = db.withTransaction { implicit session =>
    val labelSeverityId: Int =
      (labelSeverities returning labelSeverities.map(_.labelSeverityId)) += labelSev
    labelSeverityId
  }

  /**
    * Updates severity of the specified id to be newSeverity.
    *
    * @param severityId
    * @param newSeverity
    * @return
    */
  def updateSeverity(severityId: Int, newSeverity: Int) = db.withTransaction { implicit session =>
    val severities = labelSeverities.filter(_.labelSeverityId === severityId).map(x => x.severity)
    severities.update(newSeverity)
  }
}

