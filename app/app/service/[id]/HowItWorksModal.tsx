'use client';

import React from 'react';
import { Modal, Button, Typography, Space, Alert } from 'antd';
import { InfoCircleOutlined, SwapOutlined, FileTextOutlined, TableOutlined } from '@ant-design/icons';
import { useTranslation } from '@/lib/i18n';

const { Title, Paragraph } = Typography;

interface HowItWorksModalProps {
  open: boolean;
  onClose: () => void;
}

const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ open, onClose }) => {
  const { t, locale } = useTranslation();

  return (
    <Modal
      title={
        <Space>
          <InfoCircleOutlined />
          <span>{t('howItWorks.title')}</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="close" onClick={onClose}>
          {t('howItWorks.gotIt')}
        </Button>
      ]}
      centered
    >
      <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <Space orientation="vertical" style={{ width: '100%' }} size="large">
          {/* Overview */}
          <div>
            <Title level={4}>{t('howItWorks.overviewTitle')}</Title>
            <Paragraph>
              {t('howItWorks.overviewDesc')}
            </Paragraph>
          </div>

          {/* Three Core Concepts */}
          <div>
            <Title level={4}>{t('howItWorks.coreConcepts')}</Title>

            <div style={{ marginBottom: 16 }}>
              <Title level={5}>
                <Space>
                  <SwapOutlined style={{ color: '#1890ff' }} />
                  {t('howItWorks.inputParamsTitle')}
                </Space>
              </Title>
              <Paragraph>
                {t('howItWorks.inputParamsDesc')}
              </Paragraph>
              <ul style={{ paddingLeft: 24 }}>
                {({ en: (
                  <>
                    <li>Select any cell that should receive user input</li>
                    <li>Click &quot;Add as Input&quot; to make it a parameter</li>
                    <li>Give it a meaningful name (e.g., &quot;interest_rate&quot;, &quot;loan_amount&quot;)</li>
                    <li>Set validation rules (min/max values, required/optional)</li>
                    <li>Perfect for: single values, configuration options, user-provided data</li>
                  </>
                ), de: (
                  <>
                    <li>W&auml;hlen Sie eine Zelle, die Benutzereingaben empfangen soll</li>
                    <li>Klicken Sie auf &quot;Als Eingabe hinzuf&uuml;gen&quot;, um sie zu einem Parameter zu machen</li>
                    <li>Vergeben Sie einen aussagekr&auml;ftigen Namen (z.B. &quot;zinssatz&quot;, &quot;darlehensbetrag&quot;)</li>
                    <li>Legen Sie Validierungsregeln fest (Min/Max-Werte, Pflicht/Optional)</li>
                    <li>Ideal f&uuml;r: Einzelwerte, Konfigurationsoptionen, vom Nutzer bereitgestellte Daten</li>
                  </>
                ) } as Record<string, React.ReactNode>)[locale] ?? (
                  <>
                    <li>Select any cell that should receive user input</li>
                    <li>Click &quot;Add as Input&quot; to make it a parameter</li>
                    <li>Give it a meaningful name (e.g., &quot;interest_rate&quot;, &quot;loan_amount&quot;)</li>
                    <li>Set validation rules (min/max values, required/optional)</li>
                    <li>Perfect for: single values, configuration options, user-provided data</li>
                  </>
                )}
              </ul>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Title level={5}>
                <Space>
                  <FileTextOutlined style={{ color: '#52c41a' }} />
                  {t('howItWorks.outputParamsTitle')}
                </Space>
              </Title>
              <Paragraph>
                {t('howItWorks.outputParamsDesc')}
              </Paragraph>
              <ul style={{ paddingLeft: 24 }}>
                {({ en: (
                  <>
                    <li>Select cells containing formulas or calculated results</li>
                    <li>Click &quot;Add as Output&quot;</li>
                    <li>Name your outputs clearly (e.g., &quot;monthly_payment&quot;, &quot;total_interest&quot;)</li>
                    <li>Can be single cells or ranges for tables/arrays</li>
                    <li>Perfect for: calculation results, summary statistics, generated reports</li>
                  </>
                ), de: (
                  <>
                    <li>W&auml;hlen Sie Zellen mit Formeln oder berechneten Ergebnissen</li>
                    <li>Klicken Sie auf &quot;Als Ausgabe hinzuf&uuml;gen&quot;</li>
                    <li>Benennen Sie Ihre Ausgaben klar (z.B. &quot;monatliche_rate&quot;, &quot;gesamtzinsen&quot;)</li>
                    <li>K&ouml;nnen einzelne Zellen oder Bereiche f&uuml;r Tabellen/Arrays sein</li>
                    <li>Ideal f&uuml;r: Berechnungsergebnisse, Zusammenfassungen, generierte Berichte</li>
                  </>
                ) } as Record<string, React.ReactNode>)[locale] ?? (
                  <>
                    <li>Select cells containing formulas or calculated results</li>
                    <li>Click &quot;Add as Output&quot;</li>
                    <li>Name your outputs clearly (e.g., &quot;monthly_payment&quot;, &quot;total_interest&quot;)</li>
                    <li>Can be single cells or ranges for tables/arrays</li>
                    <li>Perfect for: calculation results, summary statistics, generated reports</li>
                  </>
                )}
              </ul>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Title level={5}>
                <Space>
                  <TableOutlined style={{ color: '#fa8c16' }} />
                  {t('howItWorks.editableAreasTitle')}
                </Space>
              </Title>
              <Paragraph>
                {t('howItWorks.editableAreasDesc')}
              </Paragraph>
              <ul style={{ paddingLeft: 24 }}>
                {({ en: (
                  <>
                    <li>Select a meaningful range (e.g., a tax table, parameter grid, or data structure)</li>
                    <li>Click &quot;Add as Editable Area&quot; and name it descriptively</li>
                    <li>Set granular permissions (read values, write values, read/write formulas)</li>
                    <li>AI automatically understands the area&apos;s purpose from its content</li>
                    <li>Perfect for: lookup tables, configuration grids, what-if scenarios, data transformation</li>
                  </>
                ), de: (
                  <>
                    <li>W&auml;hlen Sie einen sinnvollen Bereich (z.B. eine Steuertabelle, ein Parameter-Raster oder eine Datenstruktur)</li>
                    <li>Klicken Sie auf &quot;Als editierbaren Bereich hinzuf&uuml;gen&quot; und benennen Sie ihn beschreibend</li>
                    <li>Legen Sie granulare Berechtigungen fest (Werte lesen, Werte schreiben, Formeln lesen/schreiben)</li>
                    <li>KI versteht automatisch den Zweck des Bereichs anhand seines Inhalts</li>
                    <li>Ideal f&uuml;r: Nachschlagetabellen, Konfigurationsraster, Was-w&auml;re-wenn-Szenarien, Datentransformation</li>
                  </>
                ) } as Record<string, React.ReactNode>)[locale] ?? (
                  <>
                    <li>Select a meaningful range (e.g., a tax table, parameter grid, or data structure)</li>
                    <li>Click &quot;Add as Editable Area&quot; and name it descriptively</li>
                    <li>Set granular permissions (read values, write values, read/write formulas)</li>
                    <li>AI automatically understands the area&apos;s purpose from its content</li>
                    <li>Perfect for: lookup tables, configuration grids, what-if scenarios, data transformation</li>
                  </>
                )}
              </ul>
              <Alert
                title={t('howItWorks.keyInsightTitle')}
                description={t('howItWorks.keyInsightDesc')}
                type="success"
                style={{ marginTop: 8 }}
              />
            </div>
          </div>

          {/* How It Flows */}
          <div>
            <Title level={4}>{t('howItWorks.apiFlowTitle')}</Title>
            <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8 }}>
              <ol style={{ paddingLeft: 24, marginBottom: 0 }}>
                {({ en: (
                  <>
                    <li><strong>API Call Received</strong>: Your service receives a request with input values</li>
                    <li><strong>Inputs Applied</strong>: Values are placed into the designated input cells</li>
                    <li><strong>Calculation</strong>: Spreadsheet formulas automatically recalculate</li>
                    <li><strong>Outputs Collected</strong>: Results are read from output cells</li>
                    <li><strong>Response Sent</strong>: Calculated values are returned as JSON</li>
                  </>
                ), de: (
                  <>
                    <li><strong>API-Aufruf empfangen</strong>: Ihr Service erh&auml;lt eine Anfrage mit Eingabewerten</li>
                    <li><strong>Eingaben angewandt</strong>: Werte werden in die vorgesehenen Eingabezellen eingetragen</li>
                    <li><strong>Berechnung</strong>: Tabellenformeln berechnen automatisch neu</li>
                    <li><strong>Ausgaben gesammelt</strong>: Ergebnisse werden aus den Ausgabezellen gelesen</li>
                    <li><strong>Antwort gesendet</strong>: Berechnete Werte werden als JSON zur&uuml;ckgegeben</li>
                  </>
                ) } as Record<string, React.ReactNode>)[locale] ?? (
                  <>
                    <li><strong>API Call Received</strong>: Your service receives a request with input values</li>
                    <li><strong>Inputs Applied</strong>: Values are placed into the designated input cells</li>
                    <li><strong>Calculation</strong>: Spreadsheet formulas automatically recalculate</li>
                    <li><strong>Outputs Collected</strong>: Results are read from output cells</li>
                    <li><strong>Response Sent</strong>: Calculated values are returned as JSON</li>
                  </>
                )}
              </ol>
            </div>
          </div>

          {/* Examples */}
          <div>
            <Title level={4}>{t('howItWorks.example1Title')}</Title>
            <div style={{ background: '#e6f7ff', padding: 16, borderRadius: 8, marginBottom: 16 }}>
              <Paragraph style={{ marginBottom: 8 }}>
                <strong>{t('howItWorks.inputs')}:</strong> loan_amount (B2), interest_rate (B3), years (B4)
              </Paragraph>
              <Paragraph style={{ marginBottom: 8 }}>
                <strong>{t('howItWorks.formula')}:</strong> {t('howItWorks.cell')} E2: =PMT(B3/12, B4*12, -B2)
              </Paragraph>
              <Paragraph style={{ marginBottom: 8 }}>
                <strong>{t('howItWorks.output')}:</strong> monthly_payment (E2)
              </Paragraph>
              <Paragraph style={{ marginBottom: 0 }}>
                <strong>{t('howItWorks.apiCall')}:</strong> <code>GET /api/v1/services/loan_calc?loan_amount=200000&interest_rate=0.045&years=30</code>
              </Paragraph>
            </div>

            <Title level={4}>{t('howItWorks.example2Title')}</Title>
            <div style={{ background: '#f0f5ff', padding: 16, borderRadius: 8 }}>
              <Paragraph style={{ marginBottom: 8 }}>
                <strong>{t('howItWorks.inputParameter')}:</strong> income ({t('howItWorks.cell')} B2)
              </Paragraph>
              <Paragraph style={{ marginBottom: 8 }}>
                <strong>{t('howItWorks.editableArea')}: &quot;tax_brackets&quot; (A10:C20)</strong>
              </Paragraph>
              <div style={{ background: '#fff', padding: 8, marginBottom: 8, borderRadius: 4 }}>
                <pre style={{ margin: 0, fontSize: 12 }}>
{`  A         B           C
10 Min      Max         Rate
11 0        10,000      10%
12 10,001   40,000      12%
13 40,001   85,000      22%
14 85,001   163,000     24%`}
                </pre>
              </div>
              <Paragraph style={{ marginBottom: 8 }}>
                <strong>{t('howItWorks.aiCapabilities')}:</strong>
              </Paragraph>
              <ul style={{ paddingLeft: 24, marginBottom: 8 }}>
                {({ en: (
                  <>
                    <li>Read the tax brackets to understand the structure</li>
                    <li>Modify rates to test different tax policies</li>
                    <li>Add or remove brackets for scenario testing</li>
                    <li>Update thresholds to see impact on calculations</li>
                  </>
                ), de: (
                  <>
                    <li>Steuerstufen lesen, um die Struktur zu verstehen</li>
                    <li>S&auml;tze &auml;ndern, um verschiedene Steuerpolitiken zu testen</li>
                    <li>Stufen hinzuf&uuml;gen oder entfernen f&uuml;r Szenariotests</li>
                    <li>Schwellenwerte aktualisieren, um Auswirkungen auf Berechnungen zu sehen</li>
                  </>
                ) } as Record<string, React.ReactNode>)[locale] ?? (
                  <>
                    <li>Read the tax brackets to understand the structure</li>
                    <li>Modify rates to test different tax policies</li>
                    <li>Add or remove brackets for scenario testing</li>
                    <li>Update thresholds to see impact on calculations</li>
                  </>
                )}
              </ul>
              <Paragraph style={{ marginBottom: 0 }}>
                <strong>{t('howItWorks.aiQueryExample')}:</strong> {t('howItWorks.aiQueryExampleText')}
              </Paragraph>
              <Alert
                title={t('howItWorks.aiAutoModifies')}
                type="info"
                style={{ marginTop: 8 }}
              />
            </div>
          </div>

          {/* Area vs Parameters */}
          <div>
            <Title level={4}>{t('howItWorks.areasVsParamsTitle')}</Title>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ background: '#f6ffed', padding: 16, borderRadius: 8 }}>
                <Title level={5}>{t('howItWorks.useParamsWhen')}</Title>
                <ul style={{ paddingLeft: 24, marginBottom: 0 }}>
                  {({ en: (
                    <>
                      <li>You have specific, known inputs</li>
                      <li>Values are single cells</li>
                      <li>Structure is fixed</li>
                      <li>Traditional API usage</li>
                      <li>Example: loan_amount, interest_rate</li>
                    </>
                  ), de: (
                    <>
                      <li>Sie spezifische, bekannte Eingaben haben</li>
                      <li>Werte einzelne Zellen sind</li>
                      <li>Die Struktur fest ist</li>
                      <li>Traditionelle API-Nutzung</li>
                      <li>Beispiel: darlehensbetrag, zinssatz</li>
                    </>
                  ) } as Record<string, React.ReactNode>)[locale] ?? (
                    <>
                      <li>You have specific, known inputs</li>
                      <li>Values are single cells</li>
                      <li>Structure is fixed</li>
                      <li>Traditional API usage</li>
                      <li>Example: loan_amount, interest_rate</li>
                    </>
                  )}
                </ul>
              </div>
              <div style={{ background: '#fff7e6', padding: 16, borderRadius: 8 }}>
                <Title level={5}>{t('howItWorks.useAreasWhen')}</Title>
                <ul style={{ paddingLeft: 24, marginBottom: 0 }}>
                  {({ en: (
                    <>
                      <li>You have tables or data structures</li>
                      <li>AI needs to explore/discover</li>
                      <li>Scenarios require flexibility</li>
                      <li>What-if analysis needed</li>
                      <li>Example: tax tables, pricing grids</li>
                    </>
                  ), de: (
                    <>
                      <li>Sie Tabellen oder Datenstrukturen haben</li>
                      <li>KI erkunden/entdecken muss</li>
                      <li>Szenarien Flexibilit&auml;t erfordern</li>
                      <li>Was-w&auml;re-wenn-Analysen ben&ouml;tigt werden</li>
                      <li>Beispiel: Steuertabellen, Preisraster</li>
                    </>
                  ) } as Record<string, React.ReactNode>)[locale] ?? (
                    <>
                      <li>You have tables or data structures</li>
                      <li>AI needs to explore/discover</li>
                      <li>Scenarios require flexibility</li>
                      <li>What-if analysis needed</li>
                      <li>Example: tax tables, pricing grids</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Publishing and Using */}
          <div>
            <Title level={4}>{t('howItWorks.publishTitle')}</Title>
            <Paragraph>
              {t('howItWorks.publishDesc')}
            </Paragraph>
            <ol style={{ paddingLeft: 24 }}>
              {({ en: (
                <>
                  <li>Click &quot;Publish Service&quot; to make it available</li>
                  <li>Get your unique API endpoint</li>
                  <li>Share with developers or configure for AI assistants</li>
                  <li>Enable MCP integration for Claude and other AI tools</li>
                </>
              ), de: (
                <>
                  <li>Klicken Sie auf &quot;Service ver&ouml;ffentlichen&quot;, um ihn verf&uuml;gbar zu machen</li>
                  <li>Erhalten Sie Ihren einzigartigen API-Endpunkt</li>
                  <li>Teilen Sie mit Entwicklern oder konfigurieren Sie f&uuml;r KI-Assistenten</li>
                  <li>Aktivieren Sie die MCP-Integration f&uuml;r Claude und andere KI-Tools</li>
                </>
              ) } as Record<string, React.ReactNode>)[locale] ?? (
                <>
                  <li>Click &quot;Publish Service&quot; to make it available</li>
                  <li>Get your unique API endpoint</li>
                  <li>Share with developers or configure for AI assistants</li>
                  <li>Enable MCP integration for Claude and other AI tools</li>
                </>
              )}
            </ol>
          </div>

          {/* Making Your Service AI-Friendly */}
          <div>
            <Title level={4}>{t('howItWorks.aiFriendlyTitle')}</Title>
            <Alert
              title={t('howItWorks.aiSuccessKeyTitle')}
              description={t('howItWorks.aiSuccessKeyDesc')}
              type="success"
              icon={<InfoCircleOutlined />}
              style={{ marginBottom: 16 }}
            />

            <Title level={5}>{t('howItWorks.essentialAiFields')}</Title>
            <div style={{ marginBottom: 16 }}>
              <div style={{ background: '#f0f9ff', padding: 16, borderRadius: 8, marginBottom: 12 }}>
                <Title level={5} style={{ marginTop: 0 }}>{t('howItWorks.forParameters')}</Title>
                <ul style={{ paddingLeft: 24, marginBottom: 0 }}>
                  {({ en: (
                    <>
                      <li><strong>Title:</strong> Human-readable name (e.g., &quot;Annual Interest Rate&quot;)</li>
                      <li><strong>Description:</strong> Explain what it is and provide examples
                        <div style={{ marginLeft: 20, marginTop: 4, fontSize: 12, color: '#666' }}>
                          &#10003; Good: &quot;Annual interest rate as decimal (e.g., 0.05 for 5%, 0.075 for 7.5%)&quot;<br/>
                          &#10007; Poor: &quot;interest rate&quot;
                        </div>
                      </li>
                      <li><strong>Format hints:</strong> Specify units, ranges, formats
                        <div style={{ marginLeft: 20, marginTop: 4, fontSize: 12, color: '#666' }}>
                          Examples: &quot;USD currency&quot;, &quot;percentage as decimal&quot;, &quot;date in YYYY-MM-DD&quot;
                        </div>
                      </li>
                    </>
                  ), de: (
                    <>
                      <li><strong>Titel:</strong> Lesbarer Name (z.B. &quot;J&auml;hrlicher Zinssatz&quot;)</li>
                      <li><strong>Beschreibung:</strong> Erkl&auml;ren Sie, was es ist, und geben Sie Beispiele
                        <div style={{ marginLeft: 20, marginTop: 4, fontSize: 12, color: '#666' }}>
                          &#10003; Gut: &quot;J&auml;hrlicher Zinssatz als Dezimalzahl (z.B. 0,05 f&uuml;r 5%, 0,075 f&uuml;r 7,5%)&quot;<br/>
                          &#10007; Schlecht: &quot;Zinssatz&quot;
                        </div>
                      </li>
                      <li><strong>Formathinweise:</strong> Einheiten, Bereiche, Formate angeben
                        <div style={{ marginLeft: 20, marginTop: 4, fontSize: 12, color: '#666' }}>
                          Beispiele: &quot;EUR W&auml;hrung&quot;, &quot;Prozentsatz als Dezimalzahl&quot;, &quot;Datum im Format JJJJ-MM-TT&quot;
                        </div>
                      </li>
                    </>
                  ) } as Record<string, React.ReactNode>)[locale] ?? (
                    <>
                      <li><strong>Title:</strong> Human-readable name (e.g., &quot;Annual Interest Rate&quot;)</li>
                      <li><strong>Description:</strong> Explain what it is and provide examples
                        <div style={{ marginLeft: 20, marginTop: 4, fontSize: 12, color: '#666' }}>
                          &#10003; Good: &quot;Annual interest rate as decimal (e.g., 0.05 for 5%, 0.075 for 7.5%)&quot;<br/>
                          &#10007; Poor: &quot;interest rate&quot;
                        </div>
                      </li>
                      <li><strong>Format hints:</strong> Specify units, ranges, formats
                        <div style={{ marginLeft: 20, marginTop: 4, fontSize: 12, color: '#666' }}>
                          Examples: &quot;USD currency&quot;, &quot;percentage as decimal&quot;, &quot;date in YYYY-MM-DD&quot;
                        </div>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              <div style={{ background: '#fff7e6', padding: 16, borderRadius: 8 }}>
                <Title level={5} style={{ marginTop: 0 }}>{t('howItWorks.forEditableAreas')}</Title>
                <ul style={{ paddingLeft: 24, marginBottom: 0 }}>
                  {({ en: (
                    <>
                      <li><strong>Description:</strong> What does this area contain?
                        <div style={{ marginLeft: 20, marginTop: 4, fontSize: 12, color: '#666' }}>
                          Example: &quot;Tax bracket table with income thresholds and rates&quot;
                        </div>
                      </li>
                      <li><strong>AI Purpose:</strong> How should AI use this area?
                        <div style={{ marginLeft: 20, marginTop: 4, fontSize: 12, color: '#666' }}>
                          Example: &quot;Modify tax rates to test different policy scenarios&quot;
                        </div>
                      </li>
                      <li><strong>Expected Behavior:</strong> What should AI do/not do?
                        <div style={{ marginLeft: 20, marginTop: 4, fontSize: 12, color: '#666' }}>
                          Example: &quot;Keep rates between 0-50%, maintain progressive structure&quot;
                        </div>
                      </li>
                    </>
                  ), de: (
                    <>
                      <li><strong>Beschreibung:</strong> Was enth&auml;lt dieser Bereich?
                        <div style={{ marginLeft: 20, marginTop: 4, fontSize: 12, color: '#666' }}>
                          Beispiel: &quot;Steuerstufentabelle mit Einkommensgrenzen und S&auml;tzen&quot;
                        </div>
                      </li>
                      <li><strong>KI-Zweck:</strong> Wie soll KI diesen Bereich nutzen?
                        <div style={{ marginLeft: 20, marginTop: 4, fontSize: 12, color: '#666' }}>
                          Beispiel: &quot;Steuers&auml;tze &auml;ndern, um verschiedene Politikszenarien zu testen&quot;
                        </div>
                      </li>
                      <li><strong>Erwartetes Verhalten:</strong> Was soll KI tun/nicht tun?
                        <div style={{ marginLeft: 20, marginTop: 4, fontSize: 12, color: '#666' }}>
                          Beispiel: &quot;S&auml;tze zwischen 0-50% halten, progressive Struktur beibehalten&quot;
                        </div>
                      </li>
                    </>
                  ) } as Record<string, React.ReactNode>)[locale] ?? (
                    <>
                      <li><strong>Description:</strong> What does this area contain?
                        <div style={{ marginLeft: 20, marginTop: 4, fontSize: 12, color: '#666' }}>
                          Example: &quot;Tax bracket table with income thresholds and rates&quot;
                        </div>
                      </li>
                      <li><strong>AI Purpose:</strong> How should AI use this area?
                        <div style={{ marginLeft: 20, marginTop: 4, fontSize: 12, color: '#666' }}>
                          Example: &quot;Modify tax rates to test different policy scenarios&quot;
                        </div>
                      </li>
                      <li><strong>Expected Behavior:</strong> What should AI do/not do?
                        <div style={{ marginLeft: 20, marginTop: 4, fontSize: 12, color: '#666' }}>
                          Example: &quot;Keep rates between 0-50%, maintain progressive structure&quot;
                        </div>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            <Title level={5}>{t('howItWorks.realExampleTitle')}</Title>
            <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 8, fontSize: 13, fontFamily: 'monospace' }}>
              {({ en: (
                <>
                  <strong>Input: loan_amount</strong><br/>
                  Title: &quot;Loan Principal Amount&quot;<br/>
                  Description: &quot;Total loan amount in USD (e.g., 250000 for $250k home loan)&quot;<br/>
                  Min: 10000, Max: 10000000<br/>
                  <br/>
                  <strong>Input: interest_rate</strong><br/>
                  Title: &quot;Annual Interest Rate&quot;<br/>
                  Description: &quot;Yearly interest as decimal (0.045 = 4.5%, 0.0525 = 5.25%)&quot;<br/>
                  Format: percentage<br/>
                  <br/>
                  <strong>Area: rate_adjustments</strong><br/>
                  Description: &quot;Interest rate adjustment table by credit score&quot;<br/>
                  AI Purpose: &quot;Modify to test different lending scenarios&quot;<br/>
                  Expected: &quot;Maintain realistic spreads, higher scores = lower rates&quot;
                </>
              ), de: (
                <>
                  <strong>Eingabe: loan_amount</strong><br/>
                  Titel: &quot;Darlehensbetrag&quot;<br/>
                  Beschreibung: &quot;Gesamter Darlehensbetrag in EUR (z.B. 250000 f&uuml;r 250.000&#8364; Immobiliendarlehen)&quot;<br/>
                  Min: 10000, Max: 10000000<br/>
                  <br/>
                  <strong>Eingabe: interest_rate</strong><br/>
                  Titel: &quot;J&auml;hrlicher Zinssatz&quot;<br/>
                  Beschreibung: &quot;Jahreszins als Dezimalzahl (0,045 = 4,5%, 0,0525 = 5,25%)&quot;<br/>
                  Format: percentage<br/>
                  <br/>
                  <strong>Bereich: rate_adjustments</strong><br/>
                  Beschreibung: &quot;Zinsanpassungstabelle nach Bonit&auml;t&quot;<br/>
                  KI-Zweck: &quot;&Auml;ndern, um verschiedene Kreditszenarien zu testen&quot;<br/>
                  Erwartet: &quot;Realistische Spreads beibehalten, h&ouml;here Bonit&auml;t = niedrigere Zinsen&quot;
                </>
              ) } as Record<string, React.ReactNode>)[locale] ?? (
                <>
                  <strong>Input: loan_amount</strong><br/>
                  Title: &quot;Loan Principal Amount&quot;<br/>
                  Description: &quot;Total loan amount in USD (e.g., 250000 for $250k home loan)&quot;<br/>
                  Min: 10000, Max: 10000000<br/>
                  <br/>
                  <strong>Input: interest_rate</strong><br/>
                  Title: &quot;Annual Interest Rate&quot;<br/>
                  Description: &quot;Yearly interest as decimal (0.045 = 4.5%, 0.0525 = 5.25%)&quot;<br/>
                  Format: percentage<br/>
                  <br/>
                  <strong>Area: rate_adjustments</strong><br/>
                  Description: &quot;Interest rate adjustment table by credit score&quot;<br/>
                  AI Purpose: &quot;Modify to test different lending scenarios&quot;<br/>
                  Expected: &quot;Maintain realistic spreads, higher scores = lower rates&quot;
                </>
              )}
            </div>

            <Alert
              title={t('howItWorks.proTipTitle')}
              description={t('howItWorks.proTipDesc')}
              type="info"
              style={{ marginTop: 16 }}
            />
          </div>

          {/* AI Integration */}
          <div>
            <Title level={4}>{t('howItWorks.aiIntegrationTitle')}</Title>
            <Paragraph>
              {t('howItWorks.aiIntegrationDesc')}
            </Paragraph>
            <ul style={{ paddingLeft: 24 }}>
              {({ en: (
                <>
                  <li><strong>Service Discovery:</strong> AI automatically finds and understands your services</li>
                  <li><strong>Natural Language:</strong> &quot;Calculate my mortgage payment for $300k at 5%&quot;</li>
                  <li><strong>Intelligent Exploration:</strong> AI reads areas to understand your data structures</li>
                  <li><strong>Dynamic Modification:</strong> AI modifies lookup tables, parameters, and formulas</li>
                  <li><strong>What-If Analysis:</strong> &quot;Show me if tax rates increased by 2%&quot;</li>
                  <li><strong>Complex Workflows:</strong> Combine multiple services and areas</li>
                </>
              ), de: (
                <>
                  <li><strong>Service-Erkennung:</strong> KI findet und versteht Ihre Services automatisch</li>
                  <li><strong>Nat&uuml;rliche Sprache:</strong> &quot;Berechne meine Hypothekenrate f&uuml;r 300.000&#8364; bei 5%&quot;</li>
                  <li><strong>Intelligente Erkundung:</strong> KI liest Bereiche, um Ihre Datenstrukturen zu verstehen</li>
                  <li><strong>Dynamische &Auml;nderung:</strong> KI modifiziert Nachschlagetabellen, Parameter und Formeln</li>
                  <li><strong>Was-w&auml;re-wenn-Analyse:</strong> &quot;Zeige mir, was passiert, wenn die Steuers&auml;tze um 2% steigen&quot;</li>
                  <li><strong>Komplexe Workflows:</strong> Mehrere Services und Bereiche kombinieren</li>
                </>
              ) } as Record<string, React.ReactNode>)[locale] ?? (
                <>
                  <li><strong>Service Discovery:</strong> AI automatically finds and understands your services</li>
                  <li><strong>Natural Language:</strong> &quot;Calculate my mortgage payment for $300k at 5%&quot;</li>
                  <li><strong>Intelligent Exploration:</strong> AI reads areas to understand your data structures</li>
                  <li><strong>Dynamic Modification:</strong> AI modifies lookup tables, parameters, and formulas</li>
                  <li><strong>What-If Analysis:</strong> &quot;Show me if tax rates increased by 2%&quot;</li>
                  <li><strong>Complex Workflows:</strong> Combine multiple services and areas</li>
                </>
              )}
            </ul>
            <Alert
              title={t('howItWorks.powerUserTipTitle')}
              description={t('howItWorks.powerUserTipDesc')}
              type="success"
              style={{ marginTop: 16 }}
            />
          </div>

          {/* Best Practices */}
          <div>
            <Title level={4}>{t('howItWorks.bestPracticesTitle')}</Title>

            <div style={{ background: '#e6fffb', padding: 16, borderRadius: 8, marginBottom: 16 }}>
              <Title level={5} style={{ marginTop: 0, color: '#006d75' }}>
                {t('howItWorks.ruleOneTitle')}
              </Title>
              <Paragraph style={{ marginBottom: 8 }}>
                {t('howItWorks.ruleOneDesc')}
              </Paragraph>
              <ul style={{ paddingLeft: 24, marginBottom: 0 }}>
                {({ en: (
                  <>
                    <li>Every parameter needs a description with examples</li>
                    <li>Every area needs purpose and expected behavior</li>
                    <li>Include units, formats, and valid ranges</li>
                    <li>Write like you&apos;re training a new team member</li>
                  </>
                ), de: (
                  <>
                    <li>Jeder Parameter braucht eine Beschreibung mit Beispielen</li>
                    <li>Jeder Bereich braucht Zweck und erwartetes Verhalten</li>
                    <li>Einheiten, Formate und g&uuml;ltige Bereiche einbeziehen</li>
                    <li>Schreiben Sie, als w&uuml;rden Sie ein neues Teammitglied einarbeiten</li>
                  </>
                ) } as Record<string, React.ReactNode>)[locale] ?? (
                  <>
                    <li>Every parameter needs a description with examples</li>
                    <li>Every area needs purpose and expected behavior</li>
                    <li>Include units, formats, and valid ranges</li>
                    <li>Write like you&apos;re training a new team member</li>
                  </>
                )}
              </ul>
            </div>

            <ul style={{ paddingLeft: 24 }}>
              {({ en: (
                <>
                  <li><strong>Clear Naming</strong>: Use descriptive names (&quot;tax_rate&quot; not &quot;input1&quot;)</li>
                  <li><strong>Rich Descriptions</strong>: Include examples in every description field</li>
                  <li><strong>Smart Validation</strong>: Set min/max values and mark optional parameters</li>
                  <li><strong>Area Design</strong>: Create logical areas (entire tax table, not random cells)</li>
                  <li><strong>AI Context</strong>: Fill in ALL AI context fields (purpose, expected behavior)</li>
                  <li><strong>Error Handling</strong>: Use IFERROR() and data validation in formulas</li>
                  <li><strong>Permission Strategy</strong>: Be thoughtful about what AI can modify</li>
                  <li><strong>Test Scenarios</strong>: Try both API calls and AI interactions</li>
                  <li><strong>Examples in Descriptions</strong>: &quot;Interest rate as decimal (0.05 = 5%)&quot; is better than &quot;Interest rate&quot;</li>
                </>
              ), de: (
                <>
                  <li><strong>Klare Benennung</strong>: Beschreibende Namen verwenden (&quot;steuersatz&quot; statt &quot;eingabe1&quot;)</li>
                  <li><strong>Ausf&uuml;hrliche Beschreibungen</strong>: Beispiele in jedes Beschreibungsfeld einf&uuml;gen</li>
                  <li><strong>Intelligente Validierung</strong>: Min/Max-Werte setzen und optionale Parameter markieren</li>
                  <li><strong>Bereichs-Design</strong>: Logische Bereiche erstellen (gesamte Steuertabelle, nicht zuf&auml;llige Zellen)</li>
                  <li><strong>KI-Kontext</strong>: ALLE KI-Kontextfelder ausf&uuml;llen (Zweck, erwartetes Verhalten)</li>
                  <li><strong>Fehlerbehandlung</strong>: WENNFEHLER() und Datenvalidierung in Formeln verwenden</li>
                  <li><strong>Berechtigungsstrategie</strong>: Sorgf&auml;ltig &uuml;berlegen, was KI &auml;ndern darf</li>
                  <li><strong>Szenarien testen</strong>: Sowohl API-Aufrufe als auch KI-Interaktionen ausprobieren</li>
                  <li><strong>Beispiele in Beschreibungen</strong>: &quot;Zinssatz als Dezimalzahl (0,05 = 5%)&quot; ist besser als &quot;Zinssatz&quot;</li>
                </>
              ) } as Record<string, React.ReactNode>)[locale] ?? (
                <>
                  <li><strong>Clear Naming</strong>: Use descriptive names (&quot;tax_rate&quot; not &quot;input1&quot;)</li>
                  <li><strong>Rich Descriptions</strong>: Include examples in every description field</li>
                  <li><strong>Smart Validation</strong>: Set min/max values and mark optional parameters</li>
                  <li><strong>Area Design</strong>: Create logical areas (entire tax table, not random cells)</li>
                  <li><strong>AI Context</strong>: Fill in ALL AI context fields (purpose, expected behavior)</li>
                  <li><strong>Error Handling</strong>: Use IFERROR() and data validation in formulas</li>
                  <li><strong>Permission Strategy</strong>: Be thoughtful about what AI can modify</li>
                  <li><strong>Test Scenarios</strong>: Try both API calls and AI interactions</li>
                  <li><strong>Examples in Descriptions</strong>: &quot;Interest rate as decimal (0.05 = 5%)&quot; is better than &quot;Interest rate&quot;</li>
                </>
              )}
            </ul>
            <Alert
              title={t('howItWorks.goldenRuleTitle')}
              description={t('howItWorks.goldenRuleDesc')}
              type="warning"
              style={{ marginTop: 16 }}
            />
          </div>
        </Space>
      </div>
    </Modal>
  );
};

export default HowItWorksModal;
